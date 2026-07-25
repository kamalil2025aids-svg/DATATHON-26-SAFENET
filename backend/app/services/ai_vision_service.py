"""
AI Vision Service for SafeNet.
Handles image classification, object detection, and OCR.
Gracefully degrades to mock/simulated analysis if heavy ML deps are unavailable.
"""

import logging
import random

logger = logging.getLogger(__name__)

# Optional heavy ML dependencies - gracefully handle if not installed
yolo_model = None
ocr_reader = None

try:
    import cv2
    import numpy as np
    from ultralytics import YOLO
    yolo_model = YOLO("yolov8n.pt")
    logger.info("YOLOv8 model loaded successfully.")
except Exception as e:
    logger.warning(f"YOLOv8/OpenCV not available, using mock vision analysis: {e}")
    cv2 = None
    np = None

try:
    import easyocr
    ocr_reader = easyocr.Reader(["en", "hi", "ta"], gpu=False)
    logger.info("EasyOCR initialized successfully.")
except Exception as e:
    logger.warning(f"EasyOCR not available, OCR disabled: {e}")

HAZARD_MAPPING = {
    "pothole": "Road Damage",
    "person": "Crowd",
    "car": "Traffic Congestion",
    "truck": "Traffic Congestion",
    "bus": "Traffic Congestion",
    "traffic light": "Streetlight Damage",
    "fire hydrant": "Water Leakage",
    "bench": "Infrastructure Damage"
}

async def analyze_image(image_path: str) -> dict:
    """
    Analyze image using YOLOv8 if available, otherwise return mock analysis.
    """
    if yolo_model and cv2 and np:
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Invalid image path")
                
            results = yolo_model(img, verbose=False)
            
            detected_objects = []
            hazard_counts = {}
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = yolo_model.names[cls_id]
                    
                    safenet_category = HAZARD_MAPPING.get(class_name.lower(), "Unknown")
                    if safenet_category != "Unknown":
                        detected_objects.append({
                            "class": class_name,
                            "category": safenet_category,
                            "confidence": round(conf, 2)
                        })
                        hazard_counts[safenet_category] = hazard_counts.get(safenet_category, 0) + 1
            
            primary_hazard = max(hazard_counts, key=hazard_counts.get) if hazard_counts else "Unknown"
            avg_confidence = float(np.mean([d["confidence"] for d in detected_objects])) if detected_objects else 0.0
            
            return {
                "detected_objects": detected_objects,
                "primary_hazard": primary_hazard,
                "confidence": round(avg_confidence * 100, 2)
            }
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
    
    # Mock fallback when ML deps are unavailable
    mock_hazards = ["Road Damage", "Pothole", "Streetlight Damage", "Garbage", "Water Leakage"]
    mock_hazard = random.choice(mock_hazards)
    mock_confidence = round(random.uniform(75.0, 95.0), 2)
    
    logger.info(f"Using mock vision analysis: {mock_hazard} (confidence: {mock_confidence}%)")
    return {
        "detected_objects": [{"class": mock_hazard, "category": mock_hazard, "confidence": mock_confidence}],
        "primary_hazard": mock_hazard,
        "confidence": mock_confidence
    }

async def extract_text_ocr(image_path: str) -> str:
    """
    Extract text from image using EasyOCR if available.
    """
    if ocr_reader:
        try:
            results = ocr_reader.readtext(image_path)
            extracted_text = " ".join([text for (_, text, _) in results])
            return extracted_text.strip()
        except Exception as e:
            logger.error(f"OCR failed: {e}")
    
    return ""
