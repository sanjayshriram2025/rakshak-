from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user
from app.core.database import get_db
from app.models.evidence import Evidence, IntegrityStatus
from app.models.user import User
from app.schemas.alert import EvidenceOut, EvidenceVerifyResponse
from app.services.evidence_integrity.hash_chain import hash_chain_service
from app.services.evidence_integrity.hashing import sha256_hex
from app.utils.audit import log_action

router = APIRouter(prefix="/evidence", tags=["Evidence Integrity"])


@router.post("/hash", response_model=EvidenceOut)
async def hash_file(
    case_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Computes and records a SHA-256 hash for an arbitrary piece of
    evidence (distinct from FIR upload, which hashes automatically).
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise APIError(status.HTTP_400_BAD_REQUEST, "MISSING_FILE", "No file content provided to hash.")

    digest = sha256_hex(file_bytes)
    evidence = Evidence(
        case_id=case_id,
        file_name=file.filename,
        sha256_hash=digest,
        uploaded_by=current_user.id,
        integrity_status=IntegrityStatus.VERIFIED,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    hash_chain_service.append_block(db, digest, action=f"EVIDENCE_HASH:{file.filename}")
    log_action(db, current_user.id, "EVIDENCE_ACCESS", entity_type="EVIDENCE", entity_id=str(evidence.id))

    return evidence


@router.get("", response_model=List[EvidenceOut])
def list_evidence(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Evidence).order_by(Evidence.created_at.desc()).all()


@router.get("/{evidence_id}/verify", response_model=EvidenceVerifyResponse)
async def verify_evidence(
    evidence_id: str,
    recomputed_hash: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Verifies an evidence record's stored hash. If `recomputed_hash` (the
    hash of the file as currently held) is supplied, compares it against
    the stored hash to detect tampering; otherwise reports the stored
    integrity status as last recorded.
    """
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise APIError(status.HTTP_404_NOT_FOUND, "EVIDENCE_NOT_FOUND", "Evidence record was not found.")

    if recomputed_hash is not None:
        hash_match = recomputed_hash == evidence.sha256_hash
        evidence.integrity_status = IntegrityStatus.VERIFIED if hash_match else IntegrityStatus.TAMPERED
        db.commit()
    else:
        hash_match = evidence.integrity_status == IntegrityStatus.VERIFIED

    log_action(
        db, current_user.id, "EVIDENCE_VERIFICATION", entity_type="EVIDENCE", entity_id=str(evidence.id),
        metadata={"hash_match": hash_match},
    )

    return EvidenceVerifyResponse(
        evidence_id=evidence.id,
        integrity=evidence.integrity_status.value,
        hash_match=hash_match,
    )


@router.get("/hash-chain/status")
def hash_chain_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return hash_chain_service.verify_chain(db)
