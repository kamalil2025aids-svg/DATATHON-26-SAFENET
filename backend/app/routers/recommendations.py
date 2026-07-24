"""
Recommendations Router for SafeNet.
Retrieves AI-generated recommendations for complaints.
"""

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.models import Recommendation, Complaint
from app.utils.dependencies import get_current_user
from app.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1/recommendations", tags=["Recommendations"])
logger = logging.getLogger(__name__)

@router.get("/{ticket_id}")
async def get_recommendations(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get AI recommendations for a specific complaint."""
    # Verify complaint exists
    complaint_result = await db.execute(select(Complaint).where(Complaint.ticket_id == ticket_id))
    complaint = complaint_result.scalar_one_or_none()
    
    if not complaint:
        raise NotFoundException(f"Complaint {ticket_id} not found")
    
    # Get recommendations
    result = await db.execute(
        select(Recommendation).where(Recommendation.complaint_id == complaint.id)
    )
    recommendations = result.scalars().all()
    
    return {
        "ticket_id": ticket_id,
        "category": complaint.category,
        "recommendations": [{"action": r.action, "priority": r.priority} for r in recommendations]
    }