"""
Relationship extraction: given raw text and the entities already found
in it (from EntityExtractor), infer plausible relationships between
entity pairs.

Approach (transparent, explainable — no black box):
1. Keyword-triggered relations: certain verbs/phrases near two entities
   in the same sentence imply a specific relationship type
   (e.g. "communicated with" -> COMMUNICATED_WITH).
2. Co-occurrence fallback: entities appearing in the same sentence with
   no explicit keyword get a generic ASSOCIATED_WITH / INVOLVED_IN /
   MENTIONED_IN relation depending on entity types, at lower confidence.

Every extracted relationship records the sentence it came from as
`evidence_snippet`, so it can be traced back to source text before
being persisted with a proper evidence_id upstream.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List

from app.services.nlp.entity_extraction import ExtractedEntity

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")

# Keyword -> relationship type, checked as a substring of the sentence
# (case-insensitive). Order matters: more specific phrases first.
_KEYWORD_RULES = [
    (r"\bcommunicat\w*\s+with\b", "COMMUNICATED_WITH"),
    (r"\bcalled\b|\bphoned\b|\btexted\b", "COMMUNICATED_WITH"),
    (r"\bmember of\b|\bbelongs to\b", "MEMBER_OF"),
    (r"\bshares? (the )?same phone\b|\bshared phone\b", "SHARED_PHONE"),
    (r"\bshares? (the )?same vehicle\b|\bshared vehicle\b", "SHARED_VEHICLE"),
    (r"\bshares? (the )?same location\b|\bshared location\b", "SHARED_LOCATION"),
    (r"\buses\b|\bused\b", "USES"),
    (r"\bassociated with\b|\bknown associate\b", "ASSOCIATED_WITH"),
    (r"\binvolved in\b|\bconnected to the incident\b", "INVOLVED_IN"),
    (r"\blinked to\b", "LINKED_TO"),
]
_COMPILED_KEYWORD_RULES = [(re.compile(p, re.IGNORECASE), rel) for p, rel in _KEYWORD_RULES]


@dataclass
class ExtractedRelationship:
    source_type: str
    source_value: str
    target_type: str
    target_value: str
    relationship_type: str
    confidence: float
    evidence_snippet: str
    method: str

    def to_dict(self) -> dict:
        return {
            "source": {"type": self.source_type, "value": self.source_value},
            "target": {"type": self.target_type, "value": self.target_value},
            "relationship_type": self.relationship_type,
            "confidence": round(self.confidence, 3),
            "evidence_snippet": self.evidence_snippet,
            "method": self.method,
        }


def _default_relation_for_pair(type_a: str, type_b: str) -> str:
    pair = {type_a, type_b}
    if pair == {"PERSON", "PHONE"}:
        return "USES"
    if pair == {"PERSON", "VEHICLE"}:
        return "USES"
    if pair == {"PERSON", "LOCATION"}:
        return "ASSOCIATED_WITH"
    if pair == {"PERSON", "ORGANIZATION"}:
        return "MEMBER_OF"
    if pair == {"PERSON", "FIR"}:
        return "MENTIONED_IN"
    if pair == {"PERSON", "CASE"}:
        return "INVOLVED_IN"
    if type_a == "PERSON" and type_b == "PERSON":
        return "ASSOCIATED_WITH"
    return "ASSOCIATED_WITH"


class RelationshipExtractor:
    def extract(self, text: str, entities: List[ExtractedEntity]) -> List[ExtractedRelationship]:
        if not text or len(entities) < 2:
            return []

        relationships: List[ExtractedRelationship] = []
        sentences = self._split_with_offsets(text)

        for sent_text, sent_start, sent_end in sentences:
            sentence_entities = [e for e in entities if sent_start <= e.start < sent_end]
            if len(sentence_entities) < 2:
                continue

            keyword_relation = self._match_keyword_rule(sent_text)

            for i in range(len(sentence_entities)):
                for j in range(i + 1, len(sentence_entities)):
                    a, b = sentence_entities[i], sentence_entities[j]
                    if a.value == b.value and a.type == b.type:
                        continue

                    if keyword_relation:
                        rel_type, confidence, method = keyword_relation, 0.8, "keyword_rule"
                    else:
                        rel_type = _default_relation_for_pair(a.type, b.type)
                        confidence, method = 0.55, "co_occurrence"

                    relationships.append(
                        ExtractedRelationship(
                            source_type=a.type,
                            source_value=a.value,
                            target_type=b.type,
                            target_value=b.value,
                            relationship_type=rel_type,
                            confidence=confidence,
                            evidence_snippet=sent_text.strip(),
                            method=method,
                        )
                    )
        return relationships

    def _split_with_offsets(self, text: str):
        sentences = []
        start = 0
        for match in _SENTENCE_SPLIT_RE.finditer(text):
            end = match.start()
            sentences.append((text[start:end], start, end))
            start = match.end()
        sentences.append((text[start:], start, len(text)))
        return sentences

    def _match_keyword_rule(self, sentence: str) -> str | None:
        for pattern, rel_type in _COMPILED_KEYWORD_RULES:
            if pattern.search(sentence):
                return rel_type
        return None


relationship_extractor = RelationshipExtractor()
