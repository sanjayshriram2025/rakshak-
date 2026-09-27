from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user, require_investigator_or_admin
from app.core.database import get_db
from app.models.case import Case
from app.models.user import User
from app.schemas.case import CaseCreate, CaseOut
from app.utils.audit import log_action

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=CaseOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_investigator_or_admin)])
def create_case(payload: CaseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Case).filter(Case.case_number == payload.case_number).first()
    if existing:
        raise APIError(status.HTTP_409_CONFLICT, "CASE_EXISTS", "A case with this case number already exists.")

    case = Case(case_number=payload.case_number, title=payload.title, description=payload.description)
    db.add(case)
    db.commit()
    db.refresh(case)
    log_action(db, current_user.id, "CREATE_CASE", entity_type="CASE", entity_id=str(case.id), case_id=case.id)
    return case


@router.get("", response_model=List[CaseOut])
def list_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    log_action(db, current_user.id, "LIST_CASES")
    return db.query(Case).order_by(Case.created_at.desc()).all()


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise APIError(status.HTTP_404_NOT_FOUND, "CASE_NOT_FOUND", "Case was not found.")
    log_action(db, current_user.id, "CASE_ACCESS", entity_type="CASE", entity_id=str(case.id), case_id=case.id)
    return case
