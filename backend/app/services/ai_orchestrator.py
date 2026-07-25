"""
AI Orchestrator Service for SafeNet.
Coordinates Vision and NLP services to produce unified AI analysis output.
"""

import logging
from app.services.ai_vision_service import analyze_image, extract_text_ocr
from app.services.ai_nlp_service import analyze_text, detect_duplicates

logger = logging.getLogger(__name__)

async def run_ai_pipeline(description: str, image_path: str = None, existing_complaints: list[str] = None) -> dict:
    """
    Run the complete AI pipeline on a new complaint.
    Returns unified JSON output matching the required schema.
    """
    detected_category = None
    vision_confidence = 0.0
    ocr_text = ""
    
    # 1. Image Analysis (if image provided)
    if image_path:
        logger.info("Running Vision AI pipeline...")
        vision_result = await analyze_image(image_path)
        detected_category = vision_result.get("primary_hazard")
        vision_confidence = vision_result.get("confidence", 0.0)
        
        # Run OCR
        ocr_text = await extract_text_ocr(image_path)
        if ocr_text:
            description = f"{description}. OCR extracted: {ocr_text}"
    
    # 2. Duplicate Detection
    logger.info("Running duplicate detection...")
    duplicate_result = await detect_duplicates(description, existing_complaints or [])
    
    if duplicate_result["is_duplicate"]:
        logger.info("Duplicate complaint detected. Skipping full analysis.")
        return {
            "category": detected_category or "Duplicate",
            "severity": "Low",
            "department": "System",
            "confidence": duplicate_result["similarity_score"],
            "recommendation": "Complaint merged with existing report. Support count increased.",
            "summary": "Duplicate complaint detected and merged.",
            "is_duplicate": True,
            "similar_complaint": duplicate_result["similar_complaint"]
        }
    
    # 3. NLP Analysis
    logger.info("Running NLP analysis pipeline...")
    nlp_result = await analyze_text(description, detected_category)
    
    # 4. Combine results into final JSON
    final_confidence = max(vision_confidence, 85.0)  # Ensure minimum confidence
    
    return {
        "category": detected_category or nlp_result.get("category", "Road Damage"),
        "severity": nlp_result["severity"],
        "department": nlp_result["department"],
        "confidence": final_confidence,
        "recommendation": nlp_result["recommendation"],
        "summary": nlp_result["summary"],
        "is_duplicate": False,
        "keywords": nlp_result["keywords"],
        "ocr_text": ocr_text
    }
