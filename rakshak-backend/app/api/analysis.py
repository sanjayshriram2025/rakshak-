import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user
from app.core.database import get_db
from app.models.case import Case
from app.models.user import User
from app.services.analysis.case_analysis import run_case_analysis_and_alerts
from app.services.analysis.summary import build_case_summary
from app.services.analytics.centrality import compute_centrality
from app.services.analytics.community_detection import detect_communities
from app.services.graph.neo4j_service import neo4j_service
from app.utils.audit import log_action

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/centrality")
def get_centrality(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    graph = neo4j_service.export_full_graph()
    results = compute_centrality(graph["nodes"], graph["edges"])
    log_action(db, current_user.id, "NETWORK_ANALYSIS", metadata={"type": "centrality"})
    return {"results": results}


@router.get("/communities")
def get_communities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    graph = neo4j_service.export_full_graph()
    results = detect_communities(graph["nodes"], graph["edges"])
    log_action(db, current_user.id, "NETWORK_ANALYSIS", metadata={"type": "community_detection"})
    return {"communities": results}


@router.post("/case/{case_id}/run")
def run_analysis(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Manually (re-)triggers analytics + anomaly detection for a case, generating any new alerts."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise APIError(status.HTTP_404_NOT_FOUND, "CASE_NOT_FOUND", "Case was not found.")
    alerts = run_case_analysis_and_alerts(db, uuid.UUID(case_id))
    log_action(db, current_user.id, "CASE_ANALYSIS_RUN", entity_type="CASE", entity_id=case_id, case_id=case.id)
    return {"new_alerts_generated": len(alerts), "alert_ids": [str(a.id) for a in alerts]}


@router.get("/case/{case_id}/summary")
def get_case_summary(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise APIError(status.HTTP_404_NOT_FOUND, "CASE_NOT_FOUND", "Case was not found.")
    summary = build_case_summary(db, uuid.UUID(case_id))
    log_action(db, current_user.id, "REPORT_EXPORT", entity_type="CASE", entity_id=case_id, case_id=case.id, metadata={"type": "summary"})
    return summary
