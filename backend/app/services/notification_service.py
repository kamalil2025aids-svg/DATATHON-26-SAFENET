"""
Notification Service for SafeNet.
Handles sending notifications via Redis pub/sub and storing in DB.
"""

import logging
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis client for pub/sub
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def publish_notification(channel: str, message: dict):
    """
    Publish a notification to a Redis channel.
    """
    import json
    await redis_client.publish(channel, json.dumps(message))
    logger.info(f"Notification published to {channel}")

async def store_notification(user_id: str, title: str, body: str):
    """
    Store notification in Redis list for user.
    """
    import json
    notification = {"title": title, "body": body}
    await redis_client.lpush(f"notifications:{user_id}", json.dumps(notification))
    logger.info(f"Notification stored for user {user_id}")