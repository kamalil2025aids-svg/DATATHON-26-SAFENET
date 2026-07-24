"""
Complaint Router for SafeNet.
Handles complaint submission, retrieval, and status updates.
"""

import uuid
import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.models import Complaint, User, StatusHistory, Recommendation
from app.schemas.schemas import ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate
from app.utils.dependencies import get_current_user, get_current_officer
from app.services.ai_service import analyze_complaint
from app.services.notification_service import publish_notification
from app.utils.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/api/v1/complaints", tags=["Complaints"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a new complaint. 
    Automatically triggers AI analysis and department routing.
    """
    # Generate ticket ID
    ticket_id = f"SN-{uuid.uuid4().hex[:8].upper()}"
    
    # Create complaint record
    db_complaint = Complaint(
        ticket_id=ticket_id,
        user_id=current_user.id,
        description=complaint.description,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        address=complaint.address,
        image_url=complaint.image_url,
        video_url=complaint.video_url,
        voice_url=complaint.voice_url,
        status="submitted"
    )
    db.add(db_complaint)
    await db.flush()
    
    # Trigger AI Analysis
    ai_result = await analyze_complaint(complaint.description, complaint.image_url)
    
    # Update complaint with AI results
    db_complaint.category = ai_result["category"]
    db_complaint.severity = ai_result["severity"]
    db_complaint.department = ai_result["department"]
    db_complaint.ai_summary = ai_result["summary"]
    db_complaint.confidence_score = ai_result["confidence"]
    db_complaint.priority_score = ai_result["priority"]
    db_complaint.status = "assigned"
    
    # Save AI recommendations
    for rec in ai_result["recommendations"]:
        db_rec = Recommendation(
            complaint_id=db_complaint.id,
            action=rec,
            priority=ai_result["priority"]
        )
        db.add(db_rec)
    
    # Create status history entry
    status_history = StatusHistory(
        complaint_id=db_complaint.id,
        status="assigned",
        notes=f"AI routed to {ai_result['department']}",
        updated_by=current_user.id
    )
    db.add(status_history)
    
    await db.commit()
    await db.refresh(db_complaint)
    
    # Publish notification
    await publish_notification(
        "complaint_updates",
        {"ticket_id": ticket_id, "status": "assigned", "department": ai_result["department"]}
    )
    
    logger.info(f"Complaint created: {ticket_id} by {current_user.email}")
    
    return db_complaint

@router.get("/", response_model=list[ComplaintResponse])
async def get_complaints(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all complaints. 
    Citizens see only their complaints; officers see all.
    """
    if current_user.role == "citizen":
        result = await db.execute(
            select(Complaint)
            .where(Complaint.user_id == current_user.id)
            .order_by(Complaint.created_at.desc())
            .offset(skip).limit(limit)
        )
    else:
        result = await db.execute(
            select(Complaint)
            .order_by(Complaint.priority_score.desc(), Complaint.created_at.desc())
            .offset(skip).limit(limit)
        )
    return result.scalars().all()

@router.get("/{ticket_id}", response_model=ComplaintResponse)
async def get_complaint(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific complaint by ticket ID."""
    result = await db.execute(select(Complaint).where(Complaint.ticket_id == ticket_id))
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise NotFoundException(f"Complaint {ticket_id} not found")
    
    if current_user.role == "citizen" and complaint.user_id != current_user.id:
        raise ForbiddenException("Access denied to this complaint")
    
    return complaint

@router.patch("/{ticket_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    ticket_id: str,
    status_update: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_officer)
):
    """Update complaint status (Officer/Admin only)."""
    result = await db.execute(select(Complaint).where(Complaint.ticket_id == ticket_id))
    complaint = result.scalar_one_or_none()
    
    if not complaint:
        raise NotFoundException(f"Complaint {ticket_id} not found")
    
    complaint.status = status_update.status
    complaint.updated_at = func.now()
    
    # Add to status history
    history = StatusHistory(
        complaint_id=complaint.id,
        status=status_update.status,
        notes=status_update.notes,
        updated_by=current_user.id
    )
    db.add(history)
    await db.commit()
    await db.refresh(complaint)
    
    # Publish real-time update
    await publish_notification(
        f"complaint_{ticket_id}",
        {"ticket_id": ticket_id, "status": status_update.status, "notes": status_update.notes}
    )
    
    logger.info(f"Complaint {ticket_id} status updated to {status_update.status} by {current_user.email}")
    
    return complaint