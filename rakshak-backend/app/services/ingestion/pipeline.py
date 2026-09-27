"""
Orchestrates the full ingestion pipeline described in the project spec:

UPLOAD -> VALIDATION -> HASH -> TEXT EXTRACTION -> CLEANING ->
ENTITY EXTRACTION -> NORMALIZATION -> RELATIONSHIP EXTRACTION ->
NEO4J UPDATE -> GRAPH ANALYSIS -> ANOMALY DETECTION -> EXPLAINABILITY
-> COMPLETE

This is the one place that wires together every service module, so the
"most important end-to-end test" in the spec is a single function call.
"""
from __future__ import annotations

import re
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.entity import Entity
from app.models.entity_match import EntityMention
from app.models.evidence import Evidence, IntegrityStatus
from app.models.fir import FIR, ProcessingStatus
from app.models.relationship import Relationship, RelationshipType
from app.services.entity_resolution.resolver import entity_resolver
from app.services.evidence_integrity.hash_chain import hash_chain_service
from app.services.evidence_integrity.hashing import sha256_hex
from app.services.explainability.explainer import build_explanation, explanation_to_text
from app.services.graph.neo4j_service import neo4j_service
from app.services.nlp.entity_extraction import entity_extractor
from app.services.relationship_extraction.extractor import relationship_extractor


def _clean_text(text: str) -> str:
    """Light cleaning: normalize whitespace/newlines without destroying sentence boundaries."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


class IngestionPipeline:
    def process_fir(self, db: Session, fir: FIR, file_bytes: bytes, uploaded_by: uuid.UUID) -> FIR:
        try:
            fir.processing_status = ProcessingStatus.EXTRACTING_TEXT
            db.commit()

            from app.services.ingestion.text_extraction import extract_text

            raw_text = extract_text(file_bytes, fir.file_type.value)
            cleaned_text = _clean_text(raw_text)
            fir.extracted_text = cleaned_text
            db.commit()

            # --- Evidence + hash chain -----------------------------------
            evidence = Evidence(
                case_id=fir.case_id,
                file_name=fir.file_name,
                sha256_hash=fir.original_hash,
                uploaded_by=uploaded_by,
                integrity_status=IntegrityStatus.VERIFIED,
            )
            db.add(evidence)
            db.flush()
            hash_chain_service.append_block(db, fir.original_hash, action=f"FIR_UPLOAD:{fir.fir_number}")

            # --- Entity extraction -----------------------------------------
            fir.processing_status = ProcessingStatus.EXTRACTING_ENTITIES
            db.commit()
            extracted_entities = entity_extractor.extract(cleaned_text)

            # --- Normalization + resolution ---------------------------------
            fir.processing_status = ProcessingStatus.NORMALIZING
            db.commit()

            entity_id_lookup: dict[tuple[str, str], Entity] = {}
            for ext_entity in extracted_entities:
                if ext_entity.type in ("DATE",):
                    continue  # dates are metadata, not graph entities
                entity, _created = entity_resolver.resolve_or_create(
                    db, ext_entity.type, ext_entity.value, ext_entity.confidence
                )
                entity_id_lookup[(ext_entity.type, ext_entity.value)] = entity
                db.add(EntityMention(entity_id=entity.id, fir_id=fir.id, raw_text=ext_entity.value))

            db.commit()

            # Also ensure a CASE entity + FIR entity exist and are linked so
            # every extracted person is traceable to the case/FIR itself.
            fir_entity, _ = entity_resolver.resolve_or_create(db, "FIR", fir.fir_number, 1.0)
            db.commit()

            # --- Relationship extraction ------------------------------------
            fir.processing_status = ProcessingStatus.EXTRACTING_RELATIONSHIPS
            db.commit()
            extracted_relationships = relationship_extractor.extract(cleaned_text, extracted_entities)

            created_relationships: list[Relationship] = []
            for ext_rel in extracted_relationships:
                source = entity_id_lookup.get((ext_rel.source_type, ext_rel.source_value))
                target = entity_id_lookup.get((ext_rel.target_type, ext_rel.target_value))
                if not source or not target:
                    continue
                try:
                    rel_type = RelationshipType(ext_rel.relationship_type)
                except ValueError:
                    rel_type = RelationshipType.ASSOCIATED_WITH

                relationship = Relationship(
                    source_entity_id=source.id,
                    target_entity_id=target.id,
                    relationship_type=rel_type,
                    confidence=ext_rel.confidence,
                    evidence_id=evidence.id,
                    case_id=fir.case_id,
                )
                db.add(relationship)
                created_relationships.append(relationship)

            # Link every extracted entity to the FIR itself (MENTIONED_IN) so
            # cross-case queries can always trace back to source documents.
            for entity in entity_id_lookup.values():
                if entity.id == fir_entity.id:
                    continue
                db.add(
                    Relationship(
                        source_entity_id=entity.id,
                        target_entity_id=fir_entity.id,
                        relationship_type=RelationshipType.MENTIONED_IN,
                        confidence=1.0,
                        evidence_id=evidence.id,
                        case_id=fir.case_id,
                    )
                )
            db.commit()

            # --- Neo4j graph update (idempotent) ------------------------------
            fir.processing_status = ProcessingStatus.UPDATING_GRAPH
            db.commit()

            all_entities = list(entity_id_lookup.values()) + [fir_entity]
            for entity in all_entities:
                neo4j_service.upsert_entity_node(
                    str(entity.id), entity.entity_type.value, entity.name, entity.normalized_name
                )

            all_rels = db.query(Relationship).filter(Relationship.evidence_id == evidence.id).all()
            entity_by_id = {e.id: e for e in all_entities}
            for rel in all_rels:
                src = entity_by_id.get(rel.source_entity_id)
                tgt = entity_by_id.get(rel.target_entity_id)
                if not src or not tgt:
                    continue
                neo4j_service.upsert_relationship(
                    str(src.id),
                    src.entity_type.value,
                    str(tgt.id),
                    tgt.entity_type.value,
                    rel.relationship_type.value,
                    rel.confidence,
                    str(evidence.id),
                    str(fir.case_id),
                )

            # --- Graph analysis + anomaly detection (case-scoped) --------------
            fir.processing_status = ProcessingStatus.ANALYZING
            db.commit()

            from app.services.analysis.case_analysis import run_case_analysis_and_alerts

            fir.processing_status = ProcessingStatus.DETECTING_ANOMALIES
            db.commit()
            run_case_analysis_and_alerts(db, fir.case_id)

            fir.processing_status = ProcessingStatus.COMPLETE
            fir.processing_error = None
            db.commit()
            return fir

        except Exception as exc:
            db.rollback()
            fir.processing_status = ProcessingStatus.FAILED
            fir.processing_error = str(exc)
            db.commit()
            raise


ingestion_pipeline = IngestionPipeline()
