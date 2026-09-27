from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user
from app.core.database import get_db
from app.models.entity import Entity, EntityType
from app.models.entity_match import EntityMatch, EntityMention
from app.models.user import User
from app.schemas.network import EntityOut
from app.utils.audit import log_action

router = APIRouter(prefix="/entities", tags=["Entities"])


@router.get("", response_model=List[EntityOut])
def list_entities(
    entity_type: Optional[EntityType] = None,
    search: Optional[str] = Query(None, description="Case-insensitive substring search on normalized_name"),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Entity)
    if entity_type:
        query = query.filter(Entity.entity_type == entity_type)
    if search:
        query = query.filter(Entity.normalized_name.ilike(f"%{search.lower()}%"))
    return query.order_by(Entity.created_at.desc()).limit(limit).all()


@router.get("/{entity_id}", response_model=EntityOut)
def get_entity(entity_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise APIError(status.HTTP_404_NOT_FOUND, "ENTITY_NOT_FOUND", "Entity was not found")
    log_action(db, current_user.id, "ENTITY_ACCESS", entity_type="ENTITY", entity_id=str(entity.id))
    return entity


@router.get("/{entity_id}/mentions")
def get_entity_mentions(entity_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mentions = db.query(EntityMention).filter(EntityMention.entity_id == entity_id).all()
    return [
        {"id": str(m.id), "fir_id": str(m.fir_id), "raw_text": m.raw_text, "created_at": m.created_at}
        for m in mentions
    ]


@router.get("/{entity_id}/possible-matches")
def get_possible_matches(entity_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    matches = (
        db.query(EntityMatch)
        .filter((EntityMatch.entity_a_id == entity_id) | (EntityMatch.entity_b_id == entity_id))
        .all()
    )
    return [
        {
            "id": str(m.id),
            "entity_a_id": str(m.entity_a_id),
            "entity_b_id": str(m.entity_b_id),
            "confidence": m.confidence,
            "matching_reason": m.matching_reason,
            "status": m.status,
        }
        for m in matches
    ]
