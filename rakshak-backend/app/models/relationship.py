import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class RelationshipType(str, enum.Enum):
    COMMUNICATED_WITH = "COMMUNICATED_WITH"
    ASSOCIATED_WITH = "ASSOCIATED_WITH"
    SHARED_PHONE = "SHARED_PHONE"
    SHARED_VEHICLE = "SHARED_VEHICLE"
    SHARED_LOCATION = "SHARED_LOCATION"
    MEMBER_OF = "MEMBER_OF"
    INVOLVED_IN = "INVOLVED_IN"
    MENTIONED_IN = "MENTIONED_IN"
    LINKED_TO = "LINKED_TO"
    USES = "USES"


class Relationship(Base):
    """
    Every relationship is traceable to the FIR/document it was extracted
    from via `evidence_id` (an Evidence.id) and to the case via `case_id`.
    """

    __tablename__ = "relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False, index=True)
    target_entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False, index=True)
    relationship_type = Column(Enum(RelationshipType, name="relationship_type"), nullable=False)
    confidence = Column(Float, nullable=False, default=1.0)
    evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id"), nullable=True, index=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
