"""
Notifications Router for SafeNet.
Handles retrieving and managing user notifications.
Gracefully handles missing Redis.
"""

import json
import logging
from fastapi import APIRouter, Depends
from app.services.notification_service import get_redis_client
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])
logger = logging.getLogger(__name__)

@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Retrieve all stored notifications for the current user.
    Returns empty list if Redis is unavailable.
    """
    redis_client = await get_redis_client()
    if redis_client is None:
        return []
    try:
        notifications = await redis_client.lrange(f"notifications:{current_user.id}", 0, -1)
        return [json.loads(n) for n in notifications]
    except Exception as e:
        logger.warning(f"Failed to get notifications: {e}")
        return []

@router.delete("/")
async def clear_notifications(current_user: dict = Depends(get_current_user)):
    """Clear all notifications for the current user."""
    redis_client = await get_redis_client()
    if redis_client is None:
        return {"message": "Notifications cleared (Redis unavailable)"}
    try:
        await redis_client.delete(f"notifications:{current_user.id}")
        return {"message": "Notifications cleared"}
    except Exception as e:
        logger.warning(f"Failed to clear notifications: {e}")
        return {"message": "Notifications cleared (failed to persist)"}
