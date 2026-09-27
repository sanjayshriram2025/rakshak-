"""
Cross-case intelligence: finds entities (persons, phones, vehicles,
locations, organizations) that appear in more than one case, and
reports each pairwise case connection with supporting evidence.
"""
from __future__ import annotations

from itertools import combinations
from typing import List

from sqlalchemy.orm import Session

from app.models.entity import Entity, EntityType
from app.models.relationship import Relationship

_TYPE_TO_RELATIONSHIP_LABEL = {
    EntityType.PHONE: "SHARED_PHONE",
    EntityType.VEHICLE: "SHARED_VEHICLE",
    EntityType.LOCATION: "SHARED_LOCATION",
    EntityType.PERSON: "SHARED_PERSON",
    EntityType.ORGANIZATION: "SHARED_ORGANIZATION",
}


def find_cross_case_connections(db: Session) -> List[dict]:
    connections: List[dict] = []

    for entity_type in (
        EntityType.PERSON,
        EntityType.PHONE,
        EntityType.VEHICLE,
        EntityType.LOCATION,
        EntityType.ORGANIZATION,
    ):
        entities = db.query(Entity).filter(Entity.entity_type == entity_type).all()
        for entity in entities:
            rels = (
                db.query(Relationship)
                .filter(
                    (Relationship.source_entity_id == entity.id) | (Relationship.target_entity_id == entity.id)
                )
                .all()
            )
            case_to_evidence: dict[str, set[str]] = {}
            for r in rels:
                case_to_evidence.setdefault(str(r.case_id), set())
                if r.evidence_id:
                    case_to_evidence[str(r.case_id)].add(str(r.evidence_id))

            distinct_cases = sorted(case_to_evidence.keys())
            if len(distinct_cases) < 2:
                continue

            for case_a, case_b in combinations(distinct_cases, 2):
                evidence = sorted(case_to_evidence[case_a] | case_to_evidence[case_b])
                confidence = min(0.75 + 0.05 * len(evidence), 0.99)
                connections.append(
                    {
                        "case_a": case_a,
                        "case_b": case_b,
                        "shared_entity": str(entity.id),
                        "shared_entity_name": entity.name,
                        "relationship": _TYPE_TO_RELATIONSHIP_LABEL[entity_type],
                        "confidence": round(confidence, 3),
                        "evidence": evidence,
                    }
                )

    return connections
