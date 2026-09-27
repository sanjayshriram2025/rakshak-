"""
Entity normalization: produces a canonical `normalized_name` for a raw
extracted value, plus a similarity function used to flag *possible*
identity matches between existing entities.

Hard rule from the project spec: normalization NEVER auto-merges two
entities on its own. It only proposes candidate matches with a
confidence score and a human-readable reason; merging requires either
a high-confidence exact normalized-name collision (handled at the
entity-creation layer) or explicit investigator confirmation of an
EntityMatch row.
"""
from __future__ import annotations

import difflib
import re

PHONE_STRIP_RE = re.compile(r"[^\d]")
VEHICLE_STRIP_RE = re.compile(r"[\s\-]")


def normalize_person_name(raw_name: str) -> str:
    """
    'rajEsh kumar' / 'RAJESH KUMAR' / 'Rajesh Kumar' -> 'rajesh kumar'
    Collapses whitespace and casing only — does not guess nicknames or
    reorder name parts, since that would risk false merges.
    """
    cleaned = re.sub(r"\s+", " ", raw_name.strip())
    return cleaned.lower()


def normalize_phone(raw_phone: str) -> str:
    digits = PHONE_STRIP_RE.sub("", raw_phone)
    # Keep only the last 10 digits (drops country code / leading 0).
    return digits[-10:] if len(digits) >= 10 else digits


def normalize_vehicle(raw_vehicle: str) -> str:
    return VEHICLE_STRIP_RE.sub("", raw_vehicle).upper()


def normalize_location(raw_location: str) -> str:
    return re.sub(r"\s+", " ", raw_location.strip()).lower()


def normalize_organization(raw_org: str) -> str:
    cleaned = re.sub(r"\s+", " ", raw_org.strip())
    return cleaned.lower()


NORMALIZERS = {
    "PERSON": normalize_person_name,
    "PHONE": normalize_phone,
    "VEHICLE": normalize_vehicle,
    "LOCATION": normalize_location,
    "ORGANIZATION": normalize_organization,
}


def normalize_by_type(entity_type: str, raw_value: str) -> str:
    normalizer = NORMALIZERS.get(entity_type)
    if normalizer is None:
        return raw_value.strip()
    return normalizer(raw_value)


def similarity_score(a: str, b: str) -> float:
    """Sequence-similarity ratio in [0, 1] using difflib (no extra deps)."""
    return difflib.SequenceMatcher(None, a, b).ratio()


def propose_match(entity_type: str, name_a: str, norm_a: str, name_b: str, norm_b: str) -> dict:
    """
    Returns {"possible_match": bool, "confidence": float, "reason": str}
    Exact normalized-name collisions get high confidence; near-misses
    (e.g. minor typos) get a moderate score and MUST be reviewed, never
    auto-merged, per project principle #8.
    """
    if norm_a == norm_b:
        return {
            "possible_match": True,
            "confidence": 0.98,
            "reason": f"Identical normalized {entity_type.lower()} value ('{norm_a}').",
        }

    score = similarity_score(norm_a, norm_b)
    if score >= 0.85:
        return {
            "possible_match": True,
            "confidence": round(score, 3),
            "reason": (
                f"High textual similarity between '{name_a}' and '{name_b}' "
                f"(normalized similarity {score:.2f}) — possible spelling variant."
            ),
        }
    return {"possible_match": False, "confidence": round(score, 3), "reason": "Below similarity threshold."}
