import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class IntegrityStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    UNVERIFIED = "UNVERIFIED"
    TAMPERED = "TAMPERED"


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    integrity_status = Column(
        Enum(IntegrityStatus, name="evidence_integrity_status"),
        nullable=False,
        default=IntegrityStatus.UNVERIFIED,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HashChainBlock(Base):
    """
    Append-only tamper-evident chain. Each block cryptographically commits
    to the previous block's hash, so any retroactive edit to a past block
    is detectable because it breaks every subsequent `current_hash`.
    Designed so a real ledger (e.g. Hyperledger Fabric) can later replace
    this table without changing the calling code's interface
    (see services/evidence_integrity/hash_chain.py).
    """

    __tablename__ = "hash_chain_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    block_index = Column(String(32), nullable=False, unique=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    previous_hash = Column(String(64), nullable=False)
    evidence_hash = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False)
    current_hash = Column(String(64), nullable=False)
