import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, Float, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.core.database import Base


class EntityType(str, enum.Enum):
    PERSON = "PERSON"
    PHONE = "PHONE"
    VEHICLE = "VEHICLE"
    LOCATION = "LOCATION"
    ORGANIZATION = "ORGANIZATION"
    CASE = "CASE"
    FIR = "FIR"


class Entity(Base):
    """
    A canonical entity record. `name` preserves the original surface form
    as first seen; `normalized_name` is the resolved/cleaned identity used
    for matching. Multiple raw mentions can point at one Entity row only
    when normalization is confident (see entity_resolution service) —
    otherwise separate Entity rows are kept with a recorded possible-match
    relationship for investigator review.
    """

    __tablename__ = "entities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(Enum(EntityType, name="entity_type"), nullable=False, index=True)
    name = Column(String(500), nullable=False)
    normalized_name = Column(String(500), nullable=False, index=True)
    confidence = Column(Float, nullable=False, default=1.0)
    entity_metadata = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
