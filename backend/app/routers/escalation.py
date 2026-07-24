"""
Auto Escalation Router for SafeNet.
Handles automatic escalation of unresolved complaints.
"""

import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.models import Complaint
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/v1/escalations", tags=["Auto Escalation"])
logger = logging.getLogger(__name__)

@router.get("/pending")
async def get_pending_escalations(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """
    Get complaints that are pending escalation based on time thresholds.
    24h -> Reminder, 48h -> Higher Officer, 72h -> District Authority, 96h -> Public
    """
    now = datetime.utcnow()
    
    result = await db.execute(
        select(Complaint).where(
            Complaint.status.in_(["assigned", "in_progress"])
        )
    )
    complaints = result.scalars().all()
    
    escalations = []
    for c in complaints:
        hours_elapsed = (now - c.created_at).total_seconds() / 3600
        level = None
        if hours_elapsed >= 96:
            level = "Public Escalation"
        elif hours_elapsed >= 72:
            level = "District Authority"
        elif hours_elapsed >= 48:
            level = "Higher Officer"
        elif hours_elapsed >= 24:
            level = "Reminder"
            
        if level:
            escalations.append({
                "ticket_id": c.ticket_id,
                "department": c.department,
                "hours_elapsed": round(hours_elapsed, 1),
                "escalation_level": level,
                "severity": c.severity
            })
    
    return {"pending_escalations": escalations, "count": len(escalations)}