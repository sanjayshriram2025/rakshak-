import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, Float, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.core.database import Base


class AlertStatus(str, enum.Enum):
    NEW = "NEW"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    DISMISSED = "DISMISSED"


class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Alert(Base):
    """
    Alerts describe a detected pattern that "may warrant investigator
    review" — never a determination of guilt. `explanation` and
    `evidence` (in metadata) make every alert auditable and explainable.
    """

    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_type = Column(String(128), nullable=False, index=True)
    severity = Column(Enum(AlertSeverity, name="alert_severity"), nullable=False)
    score = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(AlertStatus, name="alert_status"), nullable=False, default=AlertStatus.NEW)
    explanation = Column(Text, nullable=False)
    # metadata holds: entities [...], cases [...], relationships [...], pattern, evidence [...]
    alert_metadata = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
