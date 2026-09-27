"""
Explainability layer: converts a PatternFinding (or any alert-shaped
dict) into the structured, investigator-facing explanation format
required by the project spec — WHAT / WHY / entities / cases /
relationships / evidence, plus the mandatory disclaimer.
"""
from __future__ import annotations

from typing import Any, Dict, List

AI_DISCLAIMER = (
    "AI-generated intelligence is an investigative aid and requires "
    "verification by authorized personnel."
)


def build_explanation(
    what: str,
    why: str,
    entities: List[str],
    cases: List[str],
    relationships: List[dict],
    evidence: List[str],
) -> Dict[str, Any]:
    return {
        "what": what,
        "why": why,
        "entities_involved": entities,
        "supporting_cases": cases,
        "supporting_relationships": relationships,
        "supporting_evidence": evidence,
        "disclaimer": AI_DISCLAIMER,
    }


def explanation_to_text(explanation: Dict[str, Any]) -> str:
    """Renders the structured explanation as a single readable paragraph for the `explanation` text column."""
    lines = [
        f"Detected: {explanation['what']}",
        f"Reason: {explanation['why']}",
    ]
    if explanation["entities_involved"]:
        lines.append(f"Entities involved: {', '.join(explanation['entities_involved'])}")
    if explanation["supporting_cases"]:
        lines.append(f"Supporting cases: {', '.join(explanation['supporting_cases'])}")
    if explanation["supporting_evidence"]:
        lines.append(f"Supporting evidence: {', '.join(explanation['supporting_evidence'])}")
    lines.append(explanation["disclaimer"])
    return "\n".join(lines)
