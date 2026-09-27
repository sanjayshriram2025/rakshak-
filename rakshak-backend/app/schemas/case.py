import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.case import CaseStatus
from app.models.fir import FileType, ProcessingStatus


class CaseCreate(BaseModel):
    case_number: str = Field(..., min_length=2, max_length=64)
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None


class CaseOut(BaseModel):
    id: uuid.UUID
    case_number: str
    title: str
    description: Optional[str]
    status: CaseStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FIROut(BaseModel):
    id: uuid.UUID
    fir_number: str
    case_id: uuid.UUID
    file_name: str
    file_type: FileType
    original_hash: str
    processing_status: ProcessingStatus
    processing_error: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class FIRUploadResponse(BaseModel):
    fir: FIROut
    message: str
