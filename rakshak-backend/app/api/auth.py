from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import APIError, get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserOut
from app.utils.audit import log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise APIError(status.HTTP_401_UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password.")
    if not user.is_active:
        raise APIError(status.HTTP_403_FORBIDDEN, "USER_INACTIVE", "This account has been deactivated.")

    token = create_access_token(subject=str(user.id), role=user.role.value)
    log_action(db, user.id, "LOGIN", entity_type="USER", entity_id=str(user.id))

    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # JWTs are stateless; logout is a client-side token discard. We still
    # record the audit event using the authenticated caller's identity.
    log_action(db, current_user.id, "LOGOUT", entity_type="USER", entity_id=str(current_user.id))
    return {"success": True, "message": "Logged out. Discard the access token client-side."}
