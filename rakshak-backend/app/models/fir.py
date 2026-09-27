import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class FileType(str, enum.Enum):
    PDF = "PDF"
    DOCX = "DOCX"
    TXT = "TXT"
    CSV = "CSV"
    JSON = "JSON"


class ProcessingStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    EXTRACTING_TEXT = "EXTRACTING_TEXT"
    EXTRACTING_ENTITIES = "EXTRACTING_ENTITIES"
    NORMALIZING = "NORMALIZING"
    EXTRACTING_RELATIONSHIPS = "EXTRACTING_RELATIONSHIPS"
    UPDATING_GRAPH = "UPDATING_GRAPH"
    ANALYZING = "ANALYZING"
    DETECTING_ANOMALIES = "DETECTING_ANOMALIES"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class FIR(Base):
    __tablename__ = "firs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fir_number = Column(String(64), unique=True, nullable=False, index=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(Enum(FileType, name="fir_file_type"), nullable=False)
    original_hash = Column(String(64), nullable=False)  # SHA-256 hex digest
    extracted_text = Column(Text, nullable=True)
    processing_status = Column(
        Enum(ProcessingStatus, name="fir_processing_status"),
        nullable=False,
        default=ProcessingStatus.UPLOADED,
    )
    processing_error = Column(Text, nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
