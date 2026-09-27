from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user, require_investigator_or_admin
from app.core.database import get_db
from app.models.case import Case
from app.models.fir import FIR, FileType, ProcessingStatus
from app.models.user import User
from app.schemas.case import FIROut, FIRUploadResponse
from app.services.evidence_integrity.hashing import sha256_hex
from app.services.ingestion.file_validation import FileValidationError, validate_upload
from app.services.ingestion.pipeline import ingestion_pipeline
from app.utils.audit import log_action

router = APIRouter(prefix="/firs", tags=["FIRs"])


@router.post("/upload", response_model=FIRUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_fir(
    case_id: str = Form(...),
    fir_number: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_investigator_or_admin),
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise APIError(status.HTTP_404_NOT_FOUND, "CASE_NOT_FOUND", "The specified case does not exist.")

    existing_fir = db.query(FIR).filter(FIR.fir_number == fir_number).first()
    if existing_fir:
        raise APIError(status.HTTP_409_CONFLICT, "FIR_EXISTS", "A FIR with this number already exists.")

    file_bytes = await file.read()
    try:
        file_type_str = validate_upload(file.filename, file_bytes)
    except FileValidationError as exc:
        raise APIError(status.HTTP_400_BAD_REQUEST, "INVALID_FILE", str(exc))

    file_hash = sha256_hex(file_bytes)

    fir = FIR(
        fir_number=fir_number,
        case_id=case.id,
        file_name=file.filename,
        file_type=FileType(file_type_str),
        original_hash=file_hash,
        processing_status=ProcessingStatus.UPLOADED,
        uploaded_by=current_user.id,
    )
    db.add(fir)
    db.commit()
    db.refresh(fir)

    log_action(
        db, current_user.id, "FIR_UPLOAD", entity_type="FIR", entity_id=str(fir.id), case_id=case.id,
        metadata={"file_name": file.filename, "sha256": file_hash},
    )

    try:
        ingestion_pipeline.process_fir(db, fir, file_bytes, current_user.id)
        message = "FIR processed successfully through the full intelligence pipeline."
    except Exception as exc:
        message = f"FIR uploaded but processing failed: {exc}"

    db.refresh(fir)
    return FIRUploadResponse(fir=FIROut.model_validate(fir), message=message)


@router.get("", response_model=List[FIROut])
def list_firs(case_id: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(FIR)
    if case_id:
        query = query.filter(FIR.case_id == case_id)
    return query.order_by(FIR.created_at.desc()).all()


@router.get("/{fir_id}", response_model=FIROut)
def get_fir(fir_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fir = db.query(FIR).filter(FIR.id == fir_id).first()
    if not fir:
        raise APIError(status.HTTP_404_NOT_FOUND, "FIR_NOT_FOUND", "FIR was not found.")
    return fir


@router.get("/{fir_id}/status")
def get_fir_status(fir_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fir = db.query(FIR).filter(FIR.id == fir_id).first()
    if not fir:
        raise APIError(status.HTTP_404_NOT_FOUND, "FIR_NOT_FOUND", "FIR was not found.")
    return {
        "fir_id": str(fir.id),
        "fir_number": fir.fir_number,
        "processing_status": fir.processing_status.value,
        "processing_error": fir.processing_error,
    }
