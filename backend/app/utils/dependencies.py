"""
FastAPI dependencies for authentication and database access.
"""

import uuid
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.models import User
from app.utils.security import decode_token
from app.utils.exceptions import UnauthorizedException, ForbiddenException

async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    Extracts user from JWT token in Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired token")
    
    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise UnauthorizedException("User not found")
    
    return user

async def get_current_officer(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is an officer or admin."""
    if current_user.role not in ["officer", "admin"]:
        raise ForbiddenException("Officer or Admin access required")
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is an admin."""
    if current_user.role != "admin":
        raise ForbiddenException("Admin access required")
    return current_user