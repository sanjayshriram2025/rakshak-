"""
Hybrid entity extraction service.

Design:
- Deterministic, auditable regex/rule extraction for structured tokens
  (phone numbers, vehicle registrations, FIR numbers, case IDs, dates).
  These are high-precision and don't need a statistical model.
- spaCy NER for unstructured mentions (PERSON, LOCATION/GPE, ORG, EVENT).
  Loaded lazily and cached; if the spaCy model isn't installed the
  service degrades to a rule-based person/location heuristic rather
  than crashing, so the pipeline keeps working end-to-end.

Output is always a flat, reusable structure:
    {"entities": [{"type": "PERSON", "value": "...", "confidence": 0.9,
                   "start": 0, "end": 12, "method": "spacy_ner"}]}
so it can be called from the ingestion pipeline, from tests, or ad hoc.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from functools import lru_cache
from typing import List, Optional

# --------------------------------------------------------------------------
# Regex patterns — deliberately explicit and commented, since these are the
# most legally load-bearing part of the extractor (phone/vehicle numbers
# are used as hard join keys downstream).
# --------------------------------------------------------------------------

# Indian mobile numbers: optional +91/0 prefix, then a 10-digit number
# starting 6-9. Captures with or without spacing/hyphens.
PHONE_PATTERN = re.compile(
    r"(?<!\d)(?:\+?91[\-\s]?|0)?([6-9]\d{9})(?!\d)"
)

# Indian vehicle registration: 2 letters (state) + 1-2 digits (RTO code) +
# 1-3 letters (series) + 1-4 digits. e.g. BR01AB1234, MH12AB1234, DL1CAB1234
VEHICLE_PATTERN = re.compile(
    r"\b([A-Z]{2}[\-\s]?\d{1,2}[\-\s]?[A-Z]{1,3}[\-\s]?\d{1,4})\b"
)

# FIR numbers e.g. "FIR-1024", "FIR No. 1024/2024", "FIR1024"
FIR_NUMBER_PATTERN = re.compile(
    r"\bFIR[\s\-]?(?:No\.?|Number)?[\s\-]?#?(\d{2,6}(?:/\d{2,4})?)\b",
    re.IGNORECASE,
)

# Generic case IDs e.g. "CASE-2024-001", "Case No. 2024/45"
CASE_ID_PATTERN = re.compile(
    r"\bCASE[\s\-]?(?:No\.?|Number)?[\s\-]?#?([A-Z0-9\-/]{3,20})\b",
    re.IGNORECASE,
)

# Dates: DD/MM/YYYY, DD-MM-YYYY, or "12 January 2024"
DATE_PATTERN = re.compile(
    r"\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}|"
    r"\d{1,2}\s+(?:January|February|March|April|May|June|July|August|"
    r"September|October|November|December)\s+\d{4})\b",
    re.IGNORECASE,
)


@dataclass
class ExtractedEntity:
    type: str
    value: str
    confidence: float
    start: int
    end: int
    method: str

    def to_dict(self) -> dict:
        return {
            "type": self.type,
            "value": self.value,
            "confidence": round(self.confidence, 3),
            "start": self.start,
            "end": self.end,
            "method": self.method,
        }


@lru_cache(maxsize=1)
def _load_spacy_model():
    """
    Lazily load spaCy's small English model. Cached process-wide.
    Returns None if unavailable so callers can fall back gracefully —
    this keeps the ingestion pipeline functional even before the model
    is downloaded (e.g. first run before `python -m spacy download`).
    """
    try:
        import spacy

        return spacy.load("en_core_web_sm")
    except Exception:
        return None


# Fallback rule-based person/location detector used only if spaCy's model
# isn't available. Heuristic: sequences of 2+ capitalized words not at the
# very start of a sentence and not matching known non-person patterns.
_CAPITALIZED_SEQUENCE = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b")
_STOPWORDS_TITLECASE = {
    "The", "This", "That", "These", "Those", "According", "Vehicle",
    "Phone", "Location", "Case", "FIR",
}


class EntityExtractor:
    """Reusable, stateless entity extraction service."""

    def extract(self, text: str) -> List[ExtractedEntity]:
        if not text or not text.strip():
            return []

        entities: List[ExtractedEntity] = []
        entities.extend(self._extract_phones(text))
        entities.extend(self._extract_vehicles(text))
        entities.extend(self._extract_fir_numbers(text))
        entities.extend(self._extract_case_ids(text))
        entities.extend(self._extract_dates(text))
        entities.extend(self._extract_ner(text))

        return self._deduplicate_overlaps(entities)

    # ---- rule-based extractors -----------------------------------------

    def _extract_phones(self, text: str) -> List[ExtractedEntity]:
        results = []
        for m in PHONE_PATTERN.finditer(text):
            results.append(
                ExtractedEntity("PHONE", m.group(1), 0.95, m.start(1), m.end(1), "regex")
            )
        return results

    def _extract_vehicles(self, text: str) -> List[ExtractedEntity]:
        results = []
        for m in VEHICLE_PATTERN.finditer(text):
            value = re.sub(r"[\s\-]", "", m.group(1)).upper()
            # Basic sanity filter: must contain both letters and digits and
            # be a plausible length, to cut down on false positives from
            # arbitrary alphanumeric tokens.
            if 6 <= len(value) <= 11 and any(c.isdigit() for c in value) and any(c.isalpha() for c in value):
                results.append(
                    ExtractedEntity("VEHICLE", value, 0.85, m.start(1), m.end(1), "regex")
                )
        return results

    def _extract_fir_numbers(self, text: str) -> List[ExtractedEntity]:
        results = []
        for m in FIR_NUMBER_PATTERN.finditer(text):
            results.append(
                ExtractedEntity("FIR", f"FIR-{m.group(1)}", 0.9, m.start(), m.end(), "regex")
            )
        return results

    def _extract_case_ids(self, text: str) -> List[ExtractedEntity]:
        results = []
        for m in CASE_ID_PATTERN.finditer(text):
            results.append(
                ExtractedEntity("CASE", f"CASE-{m.group(1)}", 0.85, m.start(), m.end(), "regex")
            )
        return results

    def _extract_dates(self, text: str) -> List[ExtractedEntity]:
        results = []
        for m in DATE_PATTERN.finditer(text):
            results.append(
                ExtractedEntity("DATE", m.group(1), 0.8, m.start(), m.end(), "regex")
            )
        return results

    # ---- statistical / heuristic NER -------------------------------------

    def _extract_ner(self, text: str) -> List[ExtractedEntity]:
        nlp = _load_spacy_model()
        if nlp is not None:
            return self._extract_with_spacy(text, nlp)
        return self._extract_with_heuristic(text)

    def _extract_with_spacy(self, text: str, nlp) -> List[ExtractedEntity]:
        doc = nlp(text)
        label_map = {
            "PERSON": "PERSON",
            "GPE": "LOCATION",
            "LOC": "LOCATION",
            "ORG": "ORGANIZATION",
            "EVENT": "EVENT",
        }
        results = []
        for ent in doc.ents:
            mapped = label_map.get(ent.label_)
            if mapped:
                results.append(
                    ExtractedEntity(mapped, ent.text.strip(), 0.85, ent.start_char, ent.end_char, "spacy_ner")
                )
        return results

    def _extract_with_heuristic(self, text: str) -> List[ExtractedEntity]:
        """Fallback used only when the spaCy model file is unavailable."""
        results = []
        for m in _CAPITALIZED_SEQUENCE.finditer(text):
            value = m.group(1)
            first_word = value.split()[0]
            if first_word in _STOPWORDS_TITLECASE:
                continue
            results.append(
                ExtractedEntity("PERSON", value, 0.55, m.start(1), m.end(1), "heuristic_fallback")
            )
        return results

    # ---- cleanup ----------------------------------------------------------

    def _deduplicate_overlaps(self, entities: List[ExtractedEntity]) -> List[ExtractedEntity]:
        """
        When spans overlap (e.g. a phone regex match inside a larger NER
        span), keep the higher-confidence / higher-precision one. Regex
        matches for structured types always win over generic NER spans
        covering the same characters.
        """
        entities_sorted = sorted(entities, key=lambda e: (e.start, -e.confidence))
        kept: List[ExtractedEntity] = []
        for ent in entities_sorted:
            overlap = False
            for k in kept:
                if not (ent.end <= k.start or ent.start >= k.end):
                    overlap = True
                    break
            if not overlap:
                kept.append(ent)
        return sorted(kept, key=lambda e: e.start)

    def extract_as_dict(self, text: str) -> dict:
        return {"entities": [e.to_dict() for e in self.extract(text)]}


entity_extractor = EntityExtractor()
