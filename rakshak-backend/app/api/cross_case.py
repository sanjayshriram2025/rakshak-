from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.network import CrossCaseConnection
from app.services.analysis.cross_case import find_cross_case_connections
from app.utils.audit import log_action

router = APIRouter(prefix="/cross-case", tags=["Cross-Case Intelligence"])


@router.get("/connections")
def get_cross_case_connections(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    connections = find_cross_case_connections(db)
    log_action(db, current_user.id, "CROSS_CASE_QUERY", metadata={"connections_found": len(connections)})
    return {"connections": connections}
