"""
Runs graph analytics + anomaly detection for a case (or the whole
network) against real Postgres + Neo4j data, and persists resulting
Alert rows with full explanations. This is what the ingestion pipeline
calls after each FIR is processed, and what /api/analysis endpoints
call on demand.
"""
from __future__ import annotations

import uuid
from collections import defaultdict
from typing import List

from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.entity import Entity, EntityType
from app.models.relationship import Relationship, RelationshipType
from app.services.analytics.centrality import compute_centrality
from app.services.analytics.community_detection import detect_communities
from app.services.anomaly_detection.detector import PatternFinding, anomaly_detector
from app.services.explainability.explainer import build_explanation, explanation_to_text
from app.services.graph.neo4j_service import neo4j_service


def _case_ids_for_entity(db: Session, entity_id: uuid.UUID) -> List[str]:
    rels = (
        db.query(Relationship)
        .filter((Relationship.source_entity_id == entity_id) | (Relationship.target_entity_id == entity_id))
        .all()
    )
    return [str(r.case_id) for r in rels]


def _persist_finding(db: Session, finding: PatternFinding) -> Alert:
    explanation = build_explanation(
        what=finding.pattern,
        why=finding.reason,
        entities=finding.entities,
        cases=finding.cases,
        relationships=finding.relationships,
        evidence=finding.evidence,
    )
    alert = Alert(
        alert_type=finding.alert_type,
        severity=AlertSeverity(finding.severity),
        score=finding.score,
        description=finding.pattern,
        status=AlertStatus.NEW,
        explanation=explanation_to_text(explanation),
        alert_metadata={
            "entities": finding.entities,
            "cases": finding.cases,
            "relationships": finding.relationships,
            "evidence": finding.evidence,
            "structured_explanation": explanation,
        },
    )
    db.add(alert)
    return alert


def _alert_already_exists(db: Session, alert_type: str, entities: List[str]) -> bool:
    """Prevents duplicate alerts from being re-created every time a case is re-analyzed."""
    existing = (
        db.query(Alert)
        .filter(Alert.alert_type == alert_type)
        .all()
    )
    for alert in existing:
        if sorted(alert.alert_metadata.get("entities", [])) == sorted(entities):
            return True
    return False


def run_case_analysis_and_alerts(db: Session, case_id: uuid.UUID) -> List[Alert]:
    """
    Runs the full analytics + anomaly detection suite scoped around the
    entities/relationships touched by this case, but evaluated against
    the FULL graph (so cross-case patterns are still caught — a shared
    phone only shows up as suspicious when seen across cases).
    """
    graph_data = neo4j_service.export_full_graph()
    nodes, edges = graph_data["nodes"], graph_data["edges"]

    new_alerts: List[Alert] = []

    if nodes and edges:
        centrality_results = compute_centrality(nodes, edges)
        for result in centrality_results:
            entity = db.query(Entity).filter(Entity.id == result["entity_id"]).first()
            if not entity:
                continue
            case_ids = _case_ids_for_entity(db, entity.id)
            if not case_ids:
                continue

            finding = anomaly_detector.detect_highly_connected_entity(
                str(entity.id), entity.name, result["degree_centrality"], case_ids
            )
            if finding and not _alert_already_exists(db, finding.alert_type, finding.entities):
                new_alerts.append(_persist_finding(db, finding))

            finding = anomaly_detector.detect_bridge_entity(
                str(entity.id), entity.name, result["betweenness_centrality"], result["degree_centrality"], case_ids
            )
            if finding and not _alert_already_exists(db, finding.alert_type, finding.entities):
                new_alerts.append(_persist_finding(db, finding))

    # --- Shared PHONE / VEHICLE / LOCATION across cases -----------------------
    for entity_type in (EntityType.PHONE, EntityType.VEHICLE, EntityType.LOCATION):
        entities = db.query(Entity).filter(Entity.entity_type == entity_type).all()
        for entity in entities:
            rels = (
                db.query(Relationship)
                .filter(
                    (Relationship.source_entity_id == entity.id) | (Relationship.target_entity_id == entity.id)
                )
                .all()
            )
            case_ids = [str(r.case_id) for r in rels]
            evidence_ids = [str(r.evidence_id) for r in rels if r.evidence_id]
            finding = anomaly_detector.detect_shared_identifier_across_cases(
                entity_type.value, str(entity.id), entity.name, case_ids, evidence_ids
            )
            if finding and not _alert_already_exists(db, finding.alert_type, finding.entities):
                new_alerts.append(_persist_finding(db, finding))

    # --- Communication concentration -----------------------------------------
    persons = db.query(Entity).filter(Entity.entity_type == EntityType.PERSON).all()
    for person in persons:
        comm_rels = (
            db.query(Relationship)
            .filter(
                Relationship.relationship_type == RelationshipType.COMMUNICATED_WITH,
                (Relationship.source_entity_id == person.id) | (Relationship.target_entity_id == person.id),
            )
            .all()
        )
        partners = set()
        for r in comm_rels:
            partners.add(r.target_entity_id if r.source_entity_id == person.id else r.source_entity_id)
        case_ids = [str(r.case_id) for r in comm_rels]
        finding = anomaly_detector.detect_communication_concentration(
            str(person.id), person.name, len(partners), case_ids
        )
        if finding and not _alert_already_exists(db, finding.alert_type, finding.entities):
            new_alerts.append(_persist_finding(db, finding))

    # --- Relationship-count statistical outliers -------------------------------
    all_relationships = db.query(Relationship).all()
    counts: dict[str, int] = defaultdict(int)
    for r in all_relationships:
        counts[str(r.source_entity_id)] += 1
        counts[str(r.target_entity_id)] += 1
    for finding in anomaly_detector.detect_relationship_growth_outliers(counts):
        if not _alert_already_exists(db, finding.alert_type, finding.entities):
            new_alerts.append(_persist_finding(db, finding))

    db.commit()
    for alert in new_alerts:
        db.refresh(alert)
    return new_alerts
