from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user
from app.core.database import get_db
from app.models.alert import Alert, AlertStatus
from app.models.user import User
from app.schemas.alert import AlertOut, AlertStatusUpdate
from app.utils.audit import log_action

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertOut])
def list_alerts(
    status_filter: Optional[AlertStatus] = Query(None, alias="status"),
    alert_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Alert)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    return query.order_by(Alert.score.desc(), Alert.created_at.desc()).all()


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise APIError(status.HTTP_404_NOT_FOUND, "ALERT_NOT_FOUND", "Alert was not found.")
    return alert


@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(
    alert_id: str,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise APIError(status.HTTP_404_NOT_FOUND, "ALERT_NOT_FOUND", "Alert was not found.")

    previous_status = alert.status.value
    alert.status = payload.status
    db.commit()
    db.refresh(alert)

    log_action(
        db,
        current_user.id,
        "ALERT_REVIEW",
        entity_type="ALERT",
        entity_id=str(alert.id),
        metadata={"previous_status": previous_status, "new_status": payload.status.value, "note": payload.note},
    )
    return alert
