"""
Resolves a raw extracted entity mention against existing Entity rows in
PostgreSQL: exact normalized match reuses the entity, a near-miss is
recorded as an EntityMatch for investigator review (and a *new* Entity
row is still created — no silent merge), and no match creates a new
Entity row.
"""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.entity import Entity
from app.models.entity_match import EntityMatch
from app.services.entity_resolution.normalization import normalize_by_type, propose_match


class EntityResolver:
    def resolve_or_create(
        self,
        db: Session,
        entity_type: str,
        raw_value: str,
        extraction_confidence: float = 0.9,
    ) -> tuple[Entity, bool]:
        """
        Returns (entity, created). Exact normalized-name matches for the
        same entity_type are reused directly (this is safe: e.g. two
        mentions of the exact same normalized phone number ARE the same
        phone number). Fuzzy near-misses create a separate entity plus a
        recorded EntityMatch for human review — they are never merged
        automatically.
        """
        normalized = normalize_by_type(entity_type, raw_value)

        exact = (
            db.query(Entity)
            .filter(Entity.entity_type == entity_type, Entity.normalized_name == normalized)
            .first()
        )
        if exact:
            return exact, False

        new_entity = Entity(
            id=uuid.uuid4(),
            entity_type=entity_type,
            name=raw_value.strip(),
            normalized_name=normalized,
            confidence=extraction_confidence,
            entity_metadata={},
        )
        db.add(new_entity)
        db.flush()  # populate new_entity.id without committing yet

        self._flag_possible_matches(db, new_entity)
        return new_entity, True

    def _flag_possible_matches(self, db: Session, new_entity: Entity) -> None:
        """
        Compares the new entity against other entities of the same type
        and records EntityMatch rows for anything above the fuzzy
        threshold (but below exact match, which was already handled).
        Bounded to a reasonable candidate pool to keep this cheap.
        """
        candidates = (
            db.query(Entity)
            .filter(Entity.entity_type == new_entity.entity_type, Entity.id != new_entity.id)
            .limit(500)
            .all()
        )
        for candidate in candidates:
            result = propose_match(
                new_entity.entity_type,
                new_entity.name,
                new_entity.normalized_name,
                candidate.name,
                candidate.normalized_name,
            )
            if result["possible_match"] and result["confidence"] < 0.98:
                existing = (
                    db.query(EntityMatch)
                    .filter(
                        EntityMatch.entity_a_id.in_([new_entity.id, candidate.id]),
                        EntityMatch.entity_b_id.in_([new_entity.id, candidate.id]),
                    )
                    .first()
                )
                if not existing:
                    db.add(
                        EntityMatch(
                            entity_a_id=new_entity.id,
                            entity_b_id=candidate.id,
                            confidence=result["confidence"],
                            matching_reason=result["reason"],
                        )
                    )


entity_resolver = EntityResolver()
