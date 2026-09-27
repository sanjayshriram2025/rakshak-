"""
Import every model module here so that `Base.metadata.create_all()` and
Alembic autogenerate see the complete schema regardless of import order
elsewhere in the app.
"""
from app.models.user import User, UserRole  # noqa: F401
from app.models.case import Case, CaseStatus  # noqa: F401
from app.models.fir import FIR, FileType, ProcessingStatus  # noqa: F401
from app.models.entity import Entity, EntityType  # noqa: F401
from app.models.entity_match import EntityMatch, EntityMention  # noqa: F401
from app.models.relationship import Relationship, RelationshipType  # noqa: F401
from app.models.alert import Alert, AlertStatus, AlertSeverity  # noqa: F401
from app.models.evidence import Evidence, HashChainBlock, IntegrityStatus  # noqa: F401
from app.models.audit import AuditLog  # noqa: F401
