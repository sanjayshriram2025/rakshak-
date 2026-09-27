import uuid
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def log_action(
    db: Session,
    user_id: Optional[uuid.UUID],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    case_id: Optional[uuid.UUID] = None,
    status: str = "SUCCESS",
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        case_id=case_id,
        status=status,
        audit_metadata=metadata or {},
    )
    db.add(entry)
    db.commit()
    return entry
