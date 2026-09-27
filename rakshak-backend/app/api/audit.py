from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("", dependencies=[Depends(require_admin)])
def list_audit_logs(
    user_id: Optional[str] = None,
    case_id: Optional[str] = None,
    action: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = Query(200, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if case_id:
        query = query.filter(AuditLog.case_id == case_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if status_filter:
        query = query.filter(AuditLog.status == status_filter)
    if date_from:
        query = query.filter(AuditLog.timestamp >= date_from)
    if date_to:
        query = query.filter(AuditLog.timestamp <= date_to)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return {
        "logs": [
            {
                "id": str(l.id),
                "user_id": str(l.user_id) if l.user_id else None,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "case_id": str(l.case_id) if l.case_id else None,
                "timestamp": l.timestamp,
                "status": l.status,
                "metadata": l.audit_metadata,
            }
            for l in logs
        ]
    }
