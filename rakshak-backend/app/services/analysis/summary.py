"""
Builds the factual, evidence-based investigation summary for a case
(GET /api/analysis/case/{case_id}/summary). Every section is built from
real queried data — nothing is fabricated or templated with placeholder
text.
"""
from __future__ import annotations

import uuid
from typing import Any, Dict

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.services.analysis.cross_case import find_cross_case_connections
from app.services.analytics.centrality import compute_centrality
from app.services.graph.neo4j_service import neo4j_service


def build_case_summary(db: Session, case_id: uuid.UUID) -> Dict[str, Any]:
    relationships = db.query(Relationship).filter(Relationship.case_id == case_id).all()
    entity_ids = set()
    for r in relationships:
        entity_ids.add(r.source_entity_id)
        entity_ids.add(r.target_entity_id)
    entities = db.query(Entity).filter(Entity.id.in_(entity_ids)).all() if entity_ids else []

    graph_data = neo4j_service.export_full_graph()
    centrality_results = compute_centrality(graph_data["nodes"], graph_data["edges"])
    entity_id_strs = {str(e.id) for e in entities}
    case_centrality = [c for c in centrality_results if c["entity_id"] in entity_id_strs]
    case_centrality.sort(key=lambda c: c["degree_centrality"], reverse=True)

    cross_case = [
        conn
        for conn in find_cross_case_connections(db)
        if conn["case_a"] == str(case_id) or conn["case_b"] == str(case_id)
    ]

    case_alerts = []
    all_alerts = db.query(Alert).all()
    for alert in all_alerts:
        if str(case_id) in alert.alert_metadata.get("cases", []):
            case_alerts.append(alert)

    key_entities = case_centrality[:5]

    executive_summary = (
        f"This case involves {len(entities)} distinct entities connected by {len(relationships)} "
        f"recorded relationships. {len(cross_case)} cross-case connection(s) and {len(case_alerts)} "
        f"suspicious-pattern alert(s) have been identified. "
        f"All findings below are evidence-backed and require investigator verification."
    )

    return {
        "case_id": str(case_id),
        "executive_summary": executive_summary,
        "key_entities": [
            {"entity_id": c["entity_id"], "name": c["name"], "interpretation": c["interpretation"]}
            for c in key_entities
        ],
        "important_relationships": [
            {
                "id": str(r.id),
                "source_entity_id": str(r.source_entity_id),
                "target_entity_id": str(r.target_entity_id),
                "relationship_type": r.relationship_type.value,
                "confidence": r.confidence,
            }
            for r in relationships
        ],
        "cross_case_connections": cross_case,
        "suspicious_patterns": [
            {
                "alert_id": str(a.id),
                "alert_type": a.alert_type,
                "severity": a.severity.value,
                "score": a.score,
                "description": a.description,
            }
            for a in case_alerts
        ],
        "network_metrics": case_centrality,
        "supporting_evidence": sorted(
            {str(r.evidence_id) for r in relationships if r.evidence_id}
        ),
        "disclaimer": (
            "AI-generated intelligence is an investigative aid and requires "
            "verification by authorized personnel."
        ),
    }
