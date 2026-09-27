import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class EntityMatch(Base):
    """
    Records a *possible* match between two Entity rows that normalization
    flagged as similar but was NOT confident enough to auto-merge.
    Per project principle: uncertain identity matches are stored for
    investigator review, never silently merged.
    """

    __tablename__ = "entity_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_a_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False, index=True)
    entity_b_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    matching_reason = Column(String(500), nullable=False)
    status = Column(String(32), nullable=False, default="PENDING_REVIEW")  # PENDING_REVIEW, CONFIRMED, REJECTED
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EntityMention(Base):
    """
    Traceability record: which FIR/document a given Entity was mentioned
    in, and the raw surface text. This is what lets every entity and
    relationship be traced back to its source record.
    """

    __tablename__ = "entity_mentions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False, index=True)
    fir_id = Column(UUID(as_uuid=True), ForeignKey("firs.id"), nullable=False, index=True)
    raw_text = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
