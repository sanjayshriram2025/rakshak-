import uuid
from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, Field

from app.models.alert import AlertSeverity, AlertStatus
from app.models.evidence import IntegrityStatus


class AlertOut(BaseModel):
    id: uuid.UUID
    alert_type: str
    severity: AlertSeverity
    score: float
    description: str
    status: AlertStatus
    explanation: str
    alert_metadata: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertStatusUpdate(BaseModel):
    status: AlertStatus
    note: str | None = Field(default=None, max_length=1000)


class EvidenceHashRequest(BaseModel):
    case_id: uuid.UUID
    file_name: str


class EvidenceOut(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    file_name: str
    sha256_hash: str
    integrity_status: IntegrityStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class EvidenceVerifyResponse(BaseModel):
    evidence_id: uuid.UUID
    integrity: str
    hash_match: bool
