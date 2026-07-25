"""
Notification Service for SafeNet.
Handles sending notifications via Redis pub/sub and storing in DB.
Gracefully handles missing/empty Redis URL.
"""

import json
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[any] = None

async def get_redis_client():
    """
    Lazily initialize Redis client.
    Returns None if REDIS_URL is not configured, allowing graceful fallback.
    """
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    
    if not settings.REDIS_URL:
        logger.warning("REDIS_URL not set — Redis notifications are disabled.")
        _redis_client = None
        return None
    
    try:
        import redis.asyncio as redis
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        logger.info("Redis client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to connect to Redis ({e}) — notifications will be disabled.")
        _redis_client = None
    
    return _redis_client

async def publish_notification(channel: str, message: dict):
    """
    Publish a notification to a Redis channel.
    Silently no-ops if Redis is unavailable.
    """
    client = await get_redis_client()
    if client is None:
        logger.debug(f"Redis unavailable — skipping publish to {channel}")
        return
    try:
        await client.publish(channel, json.dumps(message))
        logger.info(f"Notification published to {channel}")
    except Exception as e:
        logger.warning(f"Failed to publish notification to {channel}: {e}")

async def store_notification(user_id: str, title: str, body: str):
    """
    Store notification in Redis list for user.
    Silently no-ops if Redis is unavailable.
    """
    client = await get_redis_client()
    if client is None:
        logger.debug(f"Redis unavailable — skipping store for user {user_id}")
        return
    try:
        notification = {"title": title, "body": body}
        await client.lpush(f"notifications:{user_id}", json.dumps(notification))
        logger.info(f"Notification stored for user {user_id}")
    except Exception as e:
        logger.warning(f"Failed to store notification for user {user_id}: {e}")
