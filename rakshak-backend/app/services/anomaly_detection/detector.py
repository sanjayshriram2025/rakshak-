"""
Suspicious-pattern / anomaly detection engine.

Design choice (per project rules): prefer transparent, explainable
scoring over an opaque model for this prototype. Each detector below
is a small, independently-explainable rule; scores are simple weighted
combinations of concrete graph/statistical facts, not neural outputs.
An Isolation Forest is used ONLY for one numeric-outlier check
(relationship growth velocity) where a statistical outlier test is a
natural fit — and even there, the *reason* returned is always the
concrete numbers behind the flag, not just a model score.

Every detector returns fully-populated `PatternFinding` objects so the
explainability layer never has to guess what happened.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np


@dataclass
class PatternFinding:
    alert_type: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    score: float  # 0..1
    pattern: str
    entities: List[str]
    cases: List[str]
    relationships: List[dict]
    evidence: List[str]
    reason: str

    def to_dict(self) -> dict:
        return {
            "alert_type": self.alert_type,
            "severity": self.severity,
            "score": round(self.score, 3),
            "pattern": self.pattern,
            "entities": self.entities,
            "cases": self.cases,
            "relationships": self.relationships,
            "evidence": self.evidence,
            "reason": self.reason,
        }


def _severity_from_score(score: float) -> str:
    if score >= 0.85:
        return "CRITICAL"
    if score >= 0.65:
        return "HIGH"
    if score >= 0.4:
        return "MEDIUM"
    return "LOW"


class AnomalyDetector:
    def detect_shared_identifier_across_cases(
        self, entity_type: str, entity_id: str, entity_name: str, case_ids: List[str], evidence_ids: List[str]
    ) -> Optional[PatternFinding]:
        """A PHONE or VEHICLE entity appearing across 2+ distinct cases."""
        distinct_cases = sorted(set(case_ids))
        if len(distinct_cases) < 2:
            return None
        # Score scales with number of cases sharing the identifier (diminishing returns).
        score = min(0.6 + 0.15 * (len(distinct_cases) - 2), 0.97)
        return PatternFinding(
            alert_type=f"SHARED_{entity_type}_ACROSS_CASES",
            severity=_severity_from_score(score),
            score=score,
            pattern=f"Same {entity_type.lower()} identifier appears across {len(distinct_cases)} separate cases.",
            entities=[entity_id],
            cases=distinct_cases,
            relationships=[],
            evidence=sorted(set(evidence_ids)),
            reason=(
                f"{entity_type.title()} '{entity_name}' is associated with entities appearing in "
                f"{len(distinct_cases)} separate cases ({', '.join(distinct_cases)}). This creates a "
                f"cross-case connection that may warrant investigator review."
            ),
        )

    def detect_highly_connected_entity(self, entity_id: str, entity_name: str, degree_centrality: float, case_ids: List[str]) -> Optional[PatternFinding]:
        if degree_centrality < 0.5:
            return None
        score = min(degree_centrality, 0.95)
        return PatternFinding(
            alert_type="HIGHLY_CONNECTED_ENTITY",
            severity=_severity_from_score(score),
            score=score,
            pattern="Entity has an unusually high number of direct connections relative to the network.",
            entities=[entity_id],
            cases=sorted(set(case_ids)),
            relationships=[],
            evidence=[],
            reason=(
                f"'{entity_name}' has a degree centrality of {degree_centrality:.2f}, indicating a very high "
                f"number of direct connections compared to other entities in the network. This may indicate "
                f"a Potential Key Network Node warranting further review."
            ),
        )

    def detect_bridge_entity(self, entity_id: str, entity_name: str, betweenness_centrality: float, degree_centrality: float, case_ids: List[str]) -> Optional[PatternFinding]:
        if betweenness_centrality < 0.3:
            return None
        score = min(betweenness_centrality, 0.95)
        return PatternFinding(
            alert_type="BRIDGE_ENTITY",
            severity=_severity_from_score(score),
            score=score,
            pattern="Entity structurally bridges two or more otherwise-separate clusters in the network.",
            entities=[entity_id],
            cases=sorted(set(case_ids)),
            relationships=[],
            evidence=[],
            reason=(
                f"'{entity_name}' has a betweenness centrality of {betweenness_centrality:.2f} "
                f"(degree centrality {degree_centrality:.2f}), meaning many shortest paths between other "
                f"entities pass through it. This is a structural pattern consistent with a bridge between "
                f"communities and may warrant investigator review."
            ),
        )

    def detect_location_overlap(self, location_id: str, location_name: str, person_ids: List[str], case_ids: List[str], evidence_ids: List[str]) -> Optional[PatternFinding]:
        distinct_persons = sorted(set(person_ids))
        distinct_cases = sorted(set(case_ids))
        if len(distinct_persons) < 3 or len(distinct_cases) < 2:
            return None
        score = min(0.5 + 0.1 * len(distinct_persons), 0.9)
        return PatternFinding(
            alert_type="UNUSUAL_LOCATION_OVERLAP",
            severity=_severity_from_score(score),
            score=score,
            pattern="Multiple distinct persons across multiple cases are linked to the same location.",
            entities=[location_id] + distinct_persons,
            cases=distinct_cases,
            relationships=[],
            evidence=sorted(set(evidence_ids)),
            reason=(
                f"Location '{location_name}' is associated with {len(distinct_persons)} distinct persons "
                f"across {len(distinct_cases)} cases, an unusual concentration that may warrant review."
            ),
        )

    def detect_communication_concentration(self, entity_id: str, entity_name: str, communication_partner_count: int, case_ids: List[str]) -> Optional[PatternFinding]:
        if communication_partner_count < 5:
            return None
        score = min(0.4 + 0.08 * communication_partner_count, 0.92)
        return PatternFinding(
            alert_type="UNUSUAL_COMMUNICATION_CONCENTRATION",
            severity=_severity_from_score(score),
            score=score,
            pattern="Entity communicated with an unusually large number of distinct entities.",
            entities=[entity_id],
            cases=sorted(set(case_ids)),
            relationships=[],
            evidence=[],
            reason=(
                f"'{entity_name}' has recorded COMMUNICATED_WITH relationships to "
                f"{communication_partner_count} distinct entities, well above typical volume in this "
                f"dataset, which may warrant investigator review."
            ),
        )

    def detect_repeated_co_occurrence(self, entity_a_id: str, entity_a_name: str, entity_b_id: str, entity_b_name: str, co_occurrence_count: int, case_ids: List[str], evidence_ids: List[str]) -> Optional[PatternFinding]:
        if co_occurrence_count < 3:
            return None
        score = min(0.35 + 0.12 * co_occurrence_count, 0.9)
        return PatternFinding(
            alert_type="REPEATED_ENTITY_CO_OCCURRENCE",
            severity=_severity_from_score(score),
            score=score,
            pattern="Two entities repeatedly appear together across multiple records.",
            entities=[entity_a_id, entity_b_id],
            cases=sorted(set(case_ids)),
            relationships=[],
            evidence=sorted(set(evidence_ids)),
            reason=(
                f"'{entity_a_name}' and '{entity_b_name}' co-occur in {co_occurrence_count} separate "
                f"records/relationships, a repetition pattern that may warrant investigator review."
            ),
        )

    def detect_relationship_growth_outliers(self, entity_relationship_counts: Dict[str, int]) -> List[PatternFinding]:
        """
        Statistical outlier check on relationship-count distribution using
        an Isolation Forest, as one prototype method among several — used
        only for this specific numeric-outlier check, and always paired
        with the concrete count/z-score in the explanation (never just a
        raw model score).
        """
        if len(entity_relationship_counts) < 8:
            return []

        entity_ids = list(entity_relationship_counts.keys())
        counts = np.array([[entity_relationship_counts[e]] for e in entity_ids], dtype=float)

        try:
            from sklearn.ensemble import IsolationForest

            model = IsolationForest(contamination=0.1, random_state=42)
            predictions = model.fit_predict(counts)
        except Exception:
            return []

        mean = counts.mean()
        std = counts.std() or 1.0

        findings = []
        for entity_id, prediction, count in zip(entity_ids, predictions, counts.flatten()):
            if prediction == -1 and count > mean:
                z_score = (count - mean) / std
                score = min(0.5 + 0.1 * z_score, 0.9)
                findings.append(
                    PatternFinding(
                        alert_type="RAPID_RELATIONSHIP_GROWTH",
                        severity=_severity_from_score(score),
                        score=score,
                        pattern="Entity's relationship count is a statistical outlier relative to the dataset.",
                        entities=[entity_id],
                        cases=[],
                        relationships=[],
                        evidence=[],
                        reason=(
                            f"Entity has {int(count)} relationships vs. a dataset mean of {mean:.1f} "
                            f"(z-score {z_score:.2f}), flagged as a statistical outlier by Isolation Forest. "
                            f"This numeric pattern may warrant investigator review."
                        ),
                    )
                )
        return findings


anomaly_detector = AnomalyDetector()
