import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from app.models.entity import EntityType
from app.models.relationship import RelationshipType


class EntityOut(BaseModel):
    id: uuid.UUID
    entity_type: EntityType
    name: str
    normalized_name: str
    confidence: float
    entity_metadata: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    metadata: Dict[str, Any] = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    confidence: float
    evidence: Optional[str] = None


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class CentralityResult(BaseModel):
    entity_id: str
    name: str
    degree_centrality: float
    betweenness_centrality: float
    closeness_centrality: float
    interpretation: str


class CommunityResult(BaseModel):
    community_id: int
    members: List[str]
    size: int
    key_nodes: List[str]
    connection_count: int


class CrossCaseConnection(BaseModel):
    case_a: str
    case_b: str
    shared_entity: str
    shared_entity_name: str
    relationship: str
    confidence: float
    evidence: List[str]
