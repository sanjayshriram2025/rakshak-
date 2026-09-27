import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user
from app.core.database import get_db
from app.models.entity import Entity
from app.models.user import User
from app.schemas.network import GraphEdge, GraphNode, GraphResponse
from app.services.graph.neo4j_service import neo4j_service
from app.utils.audit import log_action

router = APIRouter(prefix="/network", tags=["Network"])


def _neo4j_result_to_graph_response(result: Dict[str, Any]) -> GraphResponse:
    nodes = []
    seen_node_ids = set()
    for n in result["nodes"]:
        node_dict = dict(n)
        entity_id = node_dict.get("entity_id")
        if not entity_id or entity_id in seen_node_ids:
            continue
        seen_node_ids.add(entity_id)
        nodes.append(
            GraphNode(
                id=entity_id,
                type=node_dict.get("entity_type", "UNKNOWN"),
                label=node_dict.get("name", entity_id),
                metadata={k: v for k, v in node_dict.items() if k not in ("entity_id", "entity_type", "name")},
            )
        )

    edges = []
    for idx, r in enumerate(result["relationships"]):
        rel_dict = dict(r)
        # neo4j Relationship objects expose .start_node / .end_node / .type in the driver;
        # export_full_graph already flattens these for the full-graph case, but for path/
        # subgraph queries we access the driver's Relationship object directly.
        try:
            source_id = r.start_node["entity_id"]
            target_id = r.end_node["entity_id"]
            rel_type = r.type
        except AttributeError:
            source_id = rel_dict.get("source")
            target_id = rel_dict.get("target")
            rel_type = rel_dict.get("type")

        edges.append(
            GraphEdge(
                id=f"edge-{idx}",
                source=source_id,
                target=target_id,
                type=rel_type,
                confidence=rel_dict.get("confidence", 1.0),
                evidence=rel_dict.get("evidence_id"),
            )
        )
    return GraphResponse(nodes=nodes, edges=edges)


@router.get("/entity/{entity_id}", response_model=GraphResponse)
def get_entity_network(
    entity_id: str,
    depth: int = Query(2, ge=1, le=4),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise APIError(status.HTTP_404_NOT_FOUND, "ENTITY_NOT_FOUND", "Entity was not found")

    result = neo4j_service.get_entity_network(entity_id, depth=depth)
    log_action(db, current_user.id, "NETWORK_QUERY", entity_type="ENTITY", entity_id=entity_id)
    return _neo4j_result_to_graph_response(result)


@router.get("/case/{case_id}", response_model=GraphResponse)
def get_case_network(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = neo4j_service.get_case_network(case_id)
    log_action(db, current_user.id, "NETWORK_QUERY", entity_type="CASE", entity_id=case_id, case_id=uuid.UUID(case_id))
    return _neo4j_result_to_graph_response(result)


@router.get("/path", response_model=GraphResponse)
def get_path(
    source_id: str = Query(...),
    target_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = neo4j_service.find_path(source_id, target_id)
    log_action(db, current_user.id, "NETWORK_PATH_QUERY", metadata={"source_id": source_id, "target_id": target_id})
    return _neo4j_result_to_graph_response(result)
