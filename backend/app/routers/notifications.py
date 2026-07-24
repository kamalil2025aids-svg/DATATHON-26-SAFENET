"""
Notifications Router for SafeNet.
Handles retrieving and managing user notifications.
"""

import json
import logging
from fastapi import APIRouter, Depends
from app.services.notification_service import redis_client
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])
logger = logging.getLogger(__name__)

@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Retrieve all stored notifications for the current user.
    """
    notifications = await redis_client.lrange(f"notifications:{current_user.id}", 0, -1)
    return [json.loads(n) for n in notifications]

@router.delete("/")
async def clear_notifications(current_user: dict = Depends(get_current_user)):
    """Clear all notifications for the current user."""
    await redis_client.delete(f"notifications:{current_user.id}")
    return {"message": "Notifications cleared"}