"""
AI Vision Service for SafeNet.
Handles image classification, object detection, and OCR using YOLOv8, OpenCV, and EasyOCR.
"""

import cv2
import numpy as np
import logging
from ultralytics import YOLO
import easyocr

logger = logging.getLogger(__name__)

# Load YOLOv8 model for object detection
# In production, use a custom-trained model on city hazard datasets
try:
    yolo_model = YOLO("yolov8n.pt")
    logger.info("YOLOv8 model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load YOLOv8: {e}")
    yolo_model = None

# Initialize EasyOCR reader (supports multi-language)
try:
    ocr_reader = easyocr.Reader(["en", "hi", "ta"], gpu=False)
    logger.info("EasyOCR initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize EasyOCR: {e}")
    ocr_reader = None

# Mapping YOLO COCO classes to SafeNet hazard categories
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
    Analyze image using YOLOv8 for object detection and OpenCV for preprocessing.
    Returns detected hazards and confidence scores.
    """
    if not yolo_model:
        return {"detected_objects": [], "primary_hazard": "Unknown", "confidence": 0.0}
    
    try:
        # Read image with OpenCV
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Invalid image path")
            
        # Run YOLOv8 inference
        results = yolo_model(img, verbose=False)
        
        detected_objects = []
        hazard_counts = {}
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = yolo_model.names[cls_id]
                
                # Map to SafeNet category
                safenet_category = HAZARD_MAPPING.get(class_name.lower(), "Unknown")
                if safenet_category != "Unknown":
                    detected_objects.append({
                        "class": class_name,
                        "category": safenet_category,
                        "confidence": round(conf, 2)
                    })
                    hazard_counts[safenet_category] = hazard_counts.get(safenet_category, 0) + 1
        
        # Determine primary hazard
        primary_hazard = max(hazard_counts, key=hazard_counts.get) if hazard_counts else "Unknown"
        avg_confidence = np.mean([d["confidence"] for d in detected_objects]) if detected_objects else 0.0
        
        return {
            "detected_objects": detected_objects,
            "primary_hazard": primary_hazard,
            "confidence": round(float(avg_confidence) * 100, 2)
        }
        
    except Exception as e:
        logger.error(f"Image analysis failed: {e}")
        return {"detected_objects": [], "primary_hazard": "Unknown", "confidence": 0.0}

async def extract_text_ocr(image_path: str) -> str:
    """
    Extract text from image using EasyOCR.
    Useful for reading license plates, warning signs, or addresses.
    """
    if not ocr_reader:
        return ""
        
    try:
        results = ocr_reader.readtext(image_path)
        extracted_text = " ".join([text for (_, text, _) in results])
        return extracted_text.strip()
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        return ""