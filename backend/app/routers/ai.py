"""
AI Router for SafeNet.
Exposes AI analysis endpoints directly for testing and manual triggers.
"""

import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.ai_orchestrator import run_ai_pipeline
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/ai", tags=["AI Module"])
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    description: str
    image_path: str | None = None
    existing_complaints: list[str] = []

@router.post("/analyze")
async def analyze_endpoint(
    request: AnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Run the complete AI pipeline on a complaint.
    Includes Image Classification, Object Detection, OCR, NLP, 
    Severity Prediction, Department Recommendation, and Duplicate Detection.
    
    Returns unified JSON output:
    {
      "category": "",
      "severity": "",
      "department": "",
      "confidence": 98,
      "recommendation": "",
      "summary": ""
    }
    """
    logger.info(f"AI analysis requested by user {current_user.email}")
    
    result = await run_ai_pipeline(
        description=request.description,
        image_path=request.image_path,
        existing_complaints=request.existing_complaints
    )
    
    return result