import uuid
from typing import Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/auth/login")


class APIError(HTTPException):
    """Raises an HTTPException whose body matches the project's standard error envelope."""

    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail={"success": False, "error": {"code": code, "message": message}})


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise APIError(status.HTTP_401_UNAUTHORIZED, "INVALID_TOKEN", "Token missing subject.")
    except JWTError:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "INVALID_TOKEN", "Could not validate credentials.")

    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None or not user.is_active:
        raise APIError(status.HTTP_401_UNAUTHORIZED, "USER_INACTIVE", "User not found or inactive.")
    return user


def require_roles(*roles: UserRole):
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise APIError(
                status.HTTP_403_FORBIDDEN,
                "FORBIDDEN",
                f"Role '{current_user.role.value}' is not permitted to perform this action.",
            )
        return current_user

    return _checker


require_admin = require_roles(UserRole.ADMIN)
require_investigator_or_admin = require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
require_any_role = require_roles(UserRole.ADMIN, UserRole.INVESTIGATOR, UserRole.ANALYST)
