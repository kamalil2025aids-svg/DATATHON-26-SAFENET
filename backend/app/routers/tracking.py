"""
Real-time Tracking Router for SafeNet.
Provides WebSocket endpoint for live complaint status updates.
"""

import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.notification_service import get_redis_client

router = APIRouter(tags=["Real-time Tracking"])
logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages active WebSocket connections."""
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

manager = ConnectionManager()

@router.websocket("/ws/track")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time complaint tracking.
    Subscribes to Redis pub/sub for live updates.
    Gracefully handles missing Redis.
    """
    await manager.connect(websocket)
    
    redis_client = await get_redis_client()
    
    if redis_client is not None:
        try:
            pubsub = redis_client.pubsub()
            await pubsub.subscribe("complaint_updates")
            try:
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        await websocket.send_text(message["data"])
            except WebSocketDisconnect:
                manager.disconnect(websocket)
                await pubsub.unsubscribe("complaint_updates")
                logger.info("WebSocket disconnected and unsubscribed.")
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                manager.disconnect(websocket)
        except Exception as e:
            logger.warning(f"Redis pub/sub unavailable, WebSocket running in polling mode: {e}")
            # Fallback: just keep connection alive
            try:
                while True:
                    await websocket.receive_text()
            except WebSocketDisconnect:
                manager.disconnect(websocket)
    else:
        # No Redis - keep connection alive without live updates
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket)
