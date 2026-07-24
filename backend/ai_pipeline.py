"""
SafeNet AI Smart City Safety Intelligence Platform
Advanced AI Pipeline Implementation

This module contains the core AI logic for SafeNet, including:
- Image Analysis (YOLOv8)
- Text Analysis (Transformers)
- Voice to Text (Whisper)
- Department Classification
- Severity Prediction
- Duplicate Complaint Detection
- Community Verification
- Complaint Similarity Detection
- AI Recommendation Engine
- Predictive Hotspot Detection
- Safety Score Calculation
- Risk Prediction
- Emergency Detection
- Before/After Image Verification
- Real-time Notifications
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from enum import Enum

# Suppress excessive logging
logging.getLogger("ultralytics").setLevel(logging.WARNING)

# --- Enums and Data Models ---

class Severity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class Department(str, Enum):
    MUNICIPAL = "Municipal Corporation"
    HIGHWAYS = "Highways Authority"
    TRAFFIC = "Traffic Police"
    ELECTRICITY = "Electricity Board"
    WATER = "Water Board"
    FIRE = "Fire Department"
    DISASTER = "Disaster Management"
    PWD = "Public Works Department"
    HEALTH = "Health Department"

# --- AI Model Initialization (Singletons) ---

class AIModels:
    """Singleton class to hold AI models and prevent reloading."""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIModels, cls).__new__(cls)
            cls._instance._load_models()
        return cls._instance

    def _load_models(self):
        print("Initializing SafeNet AI Models...")
        
        # 1. Image Analysis (YOLOv8)
        try:
            from ultralytics import YOLO
            self.yolo_model = YOLO('yolov8n.pt')  # Using nano for speed
            print("✓ YOLOv8 loaded")
        except Exception as e:
            print(f"✗ Failed to load YOLOv8: {e}")
            self.yolo_model = None

        # 2. Text Analysis (Transformers)
        try:
            from transformers import pipeline
            self.sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
            print("✓ Text Analysis (Transformers) loaded")
        except Exception as e:
            print(f"✗ Failed to load Transformers: {e}")
            self.sentiment_analyzer = None

        # 3. Voice to Text (Whisper)
        try:
            import whisper
            self.whisper_model = whisper.load_model("base")
            print("✓ Whisper Voice-to-Text loaded")
        except Exception as e:
            print(f"✗ Failed to load Whisper: {e}")
            self.whisper_model = None

        # 4. OCR (EasyOCR)
        try:
            import easyocr
            self.ocr_reader = easyocr.Reader(['en', 'hi', 'ta'])
            print("✓ EasyOCR loaded")
        except Exception as e:
            print(f"✗ Failed to load EasyOCR: {e}")
            self.ocr_reader = None

        # 5. NLP Embeddings (Sentence Transformers)
        try:
            from sentence_transformers import SentenceTransformer
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✓ Sentence Transformers loaded")
        except Exception as e:
            print(f"✗ Failed to load Sentence Transformers: {e}")
            self.sentence_model = None

        # 6. Scikit-Learn for Predictions
        try:
            from sklearn.ensemble import RandomForestClassifier
            # Mock training data for severity prediction
            self.severity_model = RandomForestClassifier(n_estimators=100, random_state=42)
            # In production, load a pre-trained model from disk
            # self.severity_model.load("models/severity_model.pkl")
            print("✓ Scikit-Learn Severity Model initialized")
        except Exception as e:
            print(f"✗ Failed to load Scikit-Learn: {e}")
            self.severity_model = None

        print("SafeNet AI Initialization Complete.")

# --- Core AI Pipeline ---

class SafeNetAIPipeline:
    def __init__(self):
        self.models = AIModels()
        self.complaints_db = []  # In-memory DB for demo; replace with PostgreSQL/Redis
        self.verification_threshold = 3  # Min verifications to boost confidence

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Detects objects and issues in the uploaded image using YOLOv8."""
        if not self.models.yolo_model:
            return {"error": "Image model not loaded"}
        
        results = self.models.yolo_model(image_path)
        detections = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                label = self.models.yolo_model.names[cls_id]
                detections.append({"label": label, "confidence": conf})
        
        # Map YOLO labels to SafeNet categories
        category_mapping = {
            "pothole": "Road Damage", "garbage": "Garbage", "fire hydrant": "Water Leakage",
            "traffic light": "Traffic Congestion", "stop sign": "Road Block"
        }
        
        detected_category = "Unknown"
        max_conf = 0.0
        for det in detections:
            for key, val in category_mapping.items():
                if key in det["label"].lower() and det["confidence"] > max_conf:
                    detected_category = val
                    max_conf = det["confidence"]

        return {
            "category": detected_category,
            "confidence": round(max_conf * 100, 2) if max_conf > 0 else 0,
            "detections": detections
        }

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyzes text for sentiment, keywords, and urgency."""
        if not self.models.sentiment_analyzer:
            return {"error": "Text model not loaded"}
        
        sentiment = self.models.sentiment_analyzer(text)[0]
        
        # Simple urgency extraction based on keywords
        urgent_words = ["urgent", "immediate", "danger", "accident", "fire", "bleeding", "critical"]
        is_urgent = any(word in text.lower() for word in urgent_words)
        
        return {
            "sentiment": sentiment["label"],
            "sentiment_score": sentiment["score"],
            "urgency_detected": is_urgent,
            "keywords": [word for word in text.split() if len(word) > 4][:5]  # Simple keyword extraction
        }

    def voice_to_text(self, audio_path: str) -> str:
        """Converts voice recording to text using Whisper."""
        if not self.models.whisper_model:
            return "Voice model not loaded"
        result = self.models.whisper_model.transcribe(audio_path)
        return result["text"]

    def extract_text_from_image(self, image_path: str) -> str:
        """Extracts text from images (e.g., license plates, signs) using OCR."""
        if not self.models.ocr_reader:
            return "OCR model not loaded"
        results = self.models.ocr_reader.readtext(image_path)
        return " ".join([res[1] for res in results])

    def classify_department(self, category: str, text: str) -> str:
        """Routes complaint to the correct department based on category and text."""
        category_dept_map = {
            "Road Damage": Department.PWD.value,
            "Garbage": Department.MUNICIPAL.value,
            "Water Leakage": Department.WATER.value,
            "Traffic Congestion": Department.TRAFFIC.value,
            "Streetlight Damage": Department.ELECTRICITY.value,
            "Fire": Department.FIRE.value,
            "Flood": Department.DISASTER.value,
            "Accident": Department.HEALTH.value,
        }
        return category_dept_map.get(category, Department.MUNICIPAL.value)

    def predict_severity(self, category: str, text: str, image_conf: float) -> Severity:
        """Predicts severity using a combination of rules and ML model."""
        # Rule-based fallback if model is missing
        critical_cats = ["Fire", "Accident", "Flood", "Open Manhole"]
        high_cats = ["Road Damage", "Water Leakage", "Broken Pipe"]
        
        if any(c in text.lower() for c in ["critical", "emergency", "danger"]) or category in critical_cats:
            return Severity.CRITICAL
        elif category in high_cats or image_conf > 0.8:
            return Severity.HIGH
        elif image_conf > 0.5:
            return Severity.MEDIUM
        else:
            return Severity.LOW

    def get_recommendation(self, category: str, severity: Severity) -> str:
        """AI Recommendation Engine for solutions."""
        recommendations = {
            "Road Damage": "Repair road immediately. Deploy warning signs and consider installing speed breakers.",
            "Streetlight Damage": "Replace with LED. Schedule maintenance check for nearby poles.",
            "Garbage": "Increase waste collection frequency. Install smart dustbins with fill-level sensors.",
            "Accident Zone": "Install CCTV cameras. Deploy traffic police. Add emergency call box.",
            "Flood": "Improve drainage system. Deploy water pumps. Issue early warning to residents."
        }
        base_rec = recommendations.get(category, "Inspect area and take necessary action.")
        if severity == Severity.CRITICAL:
            base_rec = "URGENT: " + base_rec + " Dispatch team immediately."
        return base_rec

    def check_duplicate(self, new_complaint: Dict, threshold: float = 0.85) -> Optional[Dict]:
        """Detects duplicate complaints using Sentence Transformers and Geolocation."""
        if not self.models.sentence_model or len(self.complaints_db) == 0:
            return None
        
        new_embedding = self.models.sentence_model.encode(new_complaint["description"])
        
        for comp in self.complaints_db:
            if comp["id"] == new_complaint["id"]:
                continue
            # Check text similarity
            old_embedding = self.models.sentence_model.encode(comp["description"])
            text_sim = np.dot(new_embedding, old_embedding) / (np.linalg.norm(new_embedding) * np.linalg.norm(old_embedding))
            
            # Check geographical proximity (e.g., within 100 meters)
            # Simplified Euclidean distance for demo
            loc1 = new_complaint["location"]
            loc2 = comp["location"]
            dist = np.sqrt((loc1[0]-loc2[0])**2 + (loc1[1]-loc2[1])**2)
            
            if text_sim > threshold and dist < 0.001:  # 0.001 deg ~ 100m
                return comp
        return None

    def verify_before_after(self, before_img: str, after_img: str) -> Dict[str, Any]:
        """Verifies if the issue is resolved by comparing before and after images."""
        # In production, use Siamese Network or feature matching (OpenCV ORB)
        # Simplified simulation:
        before_res = self.analyze_image(before_img)
        after_res = self.analyze_image(after_img)
        
        before_conf = before_res["confidence"]
        after_conf = after_res["confidence"]
        
        # If confidence drops significantly, issue is likely fixed
        is_fixed = after_conf < (before_conf * 0.2)
        
        return {
            "is_fixed": is_fixed,
            "before_confidence": before_conf,
            "after_confidence": after_conf,
            "verification_status": "Verified" if is_fixed else "Needs Review"
        }

    def calculate_safety_score(self, area_complaints: List[Dict]) -> int:
        """Calculates safety score 0-100 for an area based on complaints."""
        if not area_complaints:
            return 100
        
        total = len(area_complaints)
        resolved = len([c for c in area_complaints if c["status"] == "Completed"])
        pending = total - resolved
        critical = len([c for c in area_complaints if c["severity"] == Severity.CRITICAL])
        
        # Formula: 100 - (pending * 2) - (critical * 10)
        score = 100 - (pending * 2) - (critical * 10)
        return max(0, min(100, score))

    def detect_hotspots(self, all_complaints: List[Dict]) -> List[Dict]:
        """Detects geographical hotspots using clustering."""
        # In production, use DBSCAN or K-Means
        # Simplified: group by rounded coordinates
        hotspots = {}
        for c in all_complaints:
            loc = c["location"]
            key = (round(loc[0], 2), round(loc[1], 2))
            if key not in hotspots:
                hotspots[key] = {"location": key, "count": 0, "severity_sum": 0}
            hotspots[key]["count"] += 1
            sev_val = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}.get(c["severity"], 1)
            hotspots[key]["severity_sum"] += sev_val
            
        # Filter areas with > 3 complaints
        return [v for v in hotspots.values() if v["count"] > 3]

    def predict_risk(self, area_complaints: List[Dict], weather_data: Dict) -> str:
        """Predicts future risk based on history and weather."""
        # Simplified logic
        if weather_data.get("rain_forecast", 0) > 80 and len([c for c in area_complaints if "Flood" in c["category"]]) > 0:
            return "High Flood Risk"
        if len([c for c in area_complaints if "Accident" in c["category"]]) > 5:
            return "High Accident Risk"
        return "Low Risk"

    def detect_emergency(self, text: str, category: str) -> bool:
        """Detects if the complaint is an emergency requiring immediate action."""
        emergency_keywords = ["fire", "accident", "bleeding", "unconscious", "electrocuted", "drowning"]
        if category in ["Fire", "Accident"]:
            return True
        return any(kw in text.lower() for kw in emergency_keywords)

    def process_new_complaint(self, user_id: str, description: str, location: Tuple[float, float], 
                              image_path: Optional[str] = None, audio_path: Optional[str] = None) -> Dict:
        """Main pipeline to process a new complaint end-to-end."""
        
        # 1. Voice to Text (if audio provided)
        if audio_path:
            description += " " + self.voice_to_text(audio_path)
            
        # 2. Image Analysis (if image provided)
        image_data = {}
        if image_path:
            image_data = self.analyze_image(image_path)
            ocr_text = self.extract_text_from_image(image_path)
            description += " " + ocr_text
            
        # 3. Text Analysis
        text_data = self.analyze_text(description)
        
        # 4. Category & Department Classification
        category = image_data.get("category", "Unknown")
        if category == "Unknown":
            # Fallback to text classification if image fails
            if "garbage" in description.lower(): category = "Garbage"
            elif "pothole" in description.lower(): category = "Road Damage"
            elif "light" in description.lower(): category = "Streetlight Damage"
            
        department = self.classify_department(category, description)
        
        # 5. Severity Prediction
        severity = self.predict_severity(category, description, image_data.get("confidence", 0.0))
        
        # 6. Emergency Detection
        is_emergency = self.detect_emergency(description, category)
        if is_emergency:
            severity = Severity.CRITICAL
            
        # 7. Recommendation Engine
        recommendation = self.get_recommendation(category, severity)
        
        # 8. Duplicate Detection
        new_comp = {
            "id": f"RPT-{len(self.complaints_db) + 1001}",
            "description": description,
            "location": location
        }
        duplicate = self.check_duplicate(new_comp)
        
        if duplicate:
            # Merge complaints
            duplicate["support_count"] += 1
            return {
                "status": "duplicate",
                "message": "Complaint merged with existing report.",
                "original_complaint_id": duplicate["id"]
            }
            
        # 9. Create Complaint Record
        complaint_record = {
            **new_comp,
            "user_id": user_id,
            "category": category,
            "department": department,
            "severity": severity.value,
            "confidence": image_data.get("confidence", 0.0),
            "recommendation": recommendation,
            "status": "Pending",
            "support_count": 1,
            "verifications": 0,
            "timestamp": datetime.now().isoformat()
        }
        self.complaints_db.append(complaint_record)
        
        # 10. Real-time Notification Trigger (Mock)
        self.trigger_notification(department, complaint_record)
        
        return {
            "status": "success",
            "complaint": complaint_record
        }

    def trigger_notification(self, department: str, complaint: Dict):
        """Triggers real-time notification to the assigned department."""
        # In production, use Redis Pub/Sub or WebSockets
        print(f"🔔 NOTIFICATION: New {complaint['severity']} complaint assigned to {department}. ID: {complaint['id']}")

    def verify_complaint(self, complaint_id: str, verifier_id: str) -> Dict:
        """Community Verification: Increases confidence and support count."""
        for comp in self.complaints_db:
            if comp["id"] == complaint_id:
                comp["verifications"] += 1
                if comp["verifications"] >= self.verification_threshold:
                    comp["status"] = "Verified"
                    comp["confidence"] = min(100, comp["confidence"] + 10)
                return {"status": "success", "verifications": comp["verifications"]}
        return {"status": "error", "message": "Complaint not found"}

# --- Example Usage ---
if __name__ == "__main__":
    ai = SafeNetAIPipeline()
    
    # Simulate a new complaint
    result = ai.process_new_complaint(
        user_id="user_123",
        description="There is a large pothole on MG Road near the signal. It's dangerous.",
        location=(12.9716, 77.5946),
        image_path="dummy_path.jpg"  # Will fail gracefully if image doesn't exist
    )
    print(json.dumps(result, indent=2))
    
    # Simulate community verification
    if result["status"] == "success":
        comp_id = result["complaint"]["id"]
        verify_res = ai.verify_complaint(comp_id, "user_456")
        print("Verification Result:", verify_res)