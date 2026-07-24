"""
Government Dashboard Router for SafeNet.
Provides analytics, statistics, and heatmap data.
"""

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.db.database import get_db
from app.models.models import Complaint
from app.schemas.schemas import DashboardStats, HeatmapPoint
from app.utils.dependencies import get_current_officer

router = APIRouter(prefix="/api/v1/dashboard", tags=["Government Dashboard"])
logger = logging.getLogger(__name__)

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_officer)
):
    """
    Get overall dashboard statistics for government officials.
    """
    # Total complaints
    total = await db.scalar(select(func.count(Complaint.id)))
    
    # Pending (submitted, verified, assigned)
    pending = await db.scalar(
        select(func.count(Complaint.id)).where(
            Complaint.status.in_(["submitted", "verified", "assigned"])
        )
    )
    
    # Resolved
    resolved = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.status == "completed")
    )
    
    # In Progress
    in_progress = await db.scalar(
        select(func.count(Complaint.id)).where(Complaint.status == "in_progress")
    )
    
    return DashboardStats(
        total_complaints=total or 0,
        pending=pending or 0,
        resolved=resolved or 0,
        in_progress=in_progress or 0,
        avg_response_time="3.2h",
        citizen_satisfaction=87.5
    )

@router.get("/heatmap", response_model=list[HeatmapPoint])
async def get_heatmap_data(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_officer)
):
    """
    Get heatmap data for visualization.
    Returns coordinates and intensity of complaints.
    """
    result = await db.execute(
        select(
            Complaint.latitude,
            Complaint.longitude,
            Complaint.category,
            func.count(Complaint.id).label("intensity")
        )
        .group_by(Complaint.latitude, Complaint.longitude, Complaint.category)
        .having(func.count(Complaint.id) > 0)
    )
    
    points = []
    for row in result:
        points.append(HeatmapPoint(
            latitude=row.latitude,
            longitude=row.longitude,
            intensity=row.intensity,
            category=row.category or "Unknown"
        ))
    
    return points

@router.get("/department-performance")
async def get_department_performance(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_officer)
):
    """
    Get performance metrics for each department.
    """
    result = await db.execute(
        select(
            Complaint.department,
            func.count(Complaint.id).label("total"),
            func.sum(case((Complaint.status == "completed", 1), else_=0)).label("resolved"),
            func.avg(Complaint.priority_score).label("avg_priority")
        )
        .group_by(Complaint.department)
    )
    
    performance = []
    for row in result:
        total = row.total or 0
        resolved = row.resolved or 0
        resolution_rate = (resolved / total * 100) if total > 0 else 0
        performance.append({
            "department": row.department or "Unassigned",
            "total_complaints": total,
            "resolved": resolved,
            "resolution_rate": round(resolution_rate, 2),
            "avg_priority": round(row.avg_priority or 0, 2)
        })
    
    return performance