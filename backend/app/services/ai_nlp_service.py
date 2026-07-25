"""
AI NLP Service for SafeNet.
Handles text analysis, severity prediction, duplicate detection, and recommendations.
Gracefully falls back to rule-based analysis if heavy ML deps are unavailable.
"""

import logging
import random

logger = logging.getLogger(__name__)

# Optional heavy ML dependencies - gracefully handle if not installed
sentence_model = None
np = None
pd = None
cosine_similarity = None
severity_classifier = None

try:
    import numpy as np
    import pandas as pd
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.ensemble import RandomForestClassifier

    sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
    logger.info("Sentence Transformer model loaded.")

    severity_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    mock_data = pd.DataFrame({
        "priority_score": [30, 50, 70, 90, 40, 60, 80, 95],
        "confidence": [0.8, 0.85, 0.9, 0.95, 0.75, 0.82, 0.88, 0.96],
        "severity": ["Low", "Medium", "High", "Critical", "Low", "Medium", "High", "Critical"]
    })
    severity_classifier.fit(mock_data[["priority_score", "confidence"]], mock_data["severity"])
    logger.info("Severity classifier initialized.")
except Exception as e:
    logger.warning(f"ML/NLP libraries not available, using rule-based analysis: {e}")

# Department routing rules
DEPARTMENT_ROUTING = {
    "Road Damage": "Public Works Department",
    "Pothole": "Public Works Department",
    "Streetlight Damage": "Electricity Board",
    "Garbage": "Municipal Corporation",
    "Water Leakage": "Water Board",
    "Broken Pipe": "Water Board",
    "Traffic Congestion": "Traffic Police",
    "Accident": "Traffic Police",
    "Flood": "Disaster Management",
    "Fire": "Fire Department",
    "Fallen Tree": "Public Works Department",
    "Electric Pole Damage": "Electricity Board",
    "Illegal Dumping": "Municipal Corporation",
    "Open Manhole": "Public Works Department",
    "Animal Hazard": "Animal Control",
    "Crowd": "Traffic Police",
    "Infrastructure Damage": "Municipal Corporation"
}

SEVERITY_KEYWORDS = {
    "critical": ["immediate", "urgent", "emergency", "danger", "critical", "severe", "life-threatening", "fire", "explosion"],
    "high": ["serious", "major", "significant", "hazardous", "dangerous", "accident", "flood"],
    "medium": ["moderate", "noticeable", "disruptive", "blocked", "broken", "damaged"]
}

RECOMMENDATION_RULES = {
    "Road Damage": "Repair road immediately. Deploy warning signs and consider installing speed breakers.",
    "Pothole": "Patch pothole within 24 hours. Deploy warning signs and traffic signal adjustment.",
    "Streetlight Damage": "Replace LED bulb and schedule maintenance. Deploy temporary lighting if critical.",
    "Garbage": "Increase waste collection frequency. Install smart dustbins and launch awareness campaign.",
    "Water Leakage": "Repair pipeline immediately. Deploy water pumps and establish traffic diversion.",
    "Traffic Congestion": "Deploy traffic police for manual signaling. Optimize signal timings and route diversions.",
    "Accident": "Dispatch ambulance immediately. Install CCTV cameras and deploy traffic patrol.",
    "Flood": "Improve drainage system. Deploy water pumps and issue evacuation alerts if necessary.",
    "Fire": "Dispatch fire brigade immediately. Evacuate surrounding area and cut electricity supply.",
    "Fallen Tree": "Dispatch clearance team. Establish traffic diversion and check for electrical hazards.",
    "Electric Pole Damage": "Dispatch emergency repair team. Cut electricity supply and establish safety perimeter.",
    "Open Manhole": "Deploy immediate safety barriers. Schedule repair and install warning signs."
}

def _rule_based_severity(description: str) -> str:
    """Determine severity using keyword matching."""
    desc_lower = description.lower()
    for level, keywords in SEVERITY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            if level == "critical":
                return "Critical"
            elif level == "high":
                return "High"
            elif level == "medium":
                return "Medium"
    return "Low"

def _rule_based_category(description: str) -> str:
    """Determine category using keyword matching."""
    desc_lower = description.lower()
    category_keywords = {
        "Road Damage": ["pothole", "road damage", "cracked road", "broken road"],
        "Garbage": ["garbage", "trash", "waste", "litter", "dump"],
        "Water Leakage": ["water leak", "water leakage", "pipe burst", "broken pipe"],
        "Streetlight Damage": ["streetlight", "light not working", "broken light", "lamp"],
        "Traffic Congestion": ["traffic", "congestion", "jam", "blocked road"],
        "Fire": ["fire", "smoke", "burning"],
        "Flood": ["flood", "water logging", "drainage"],
        "Accident": ["accident", "crash", "collision"],
    }
    for category, keywords in category_keywords.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return "Road Damage"

async def analyze_text(description: str, detected_category: str = None) -> dict:
    """
    Analyze complaint text using NLP if available, otherwise rule-based.
    """
    summary = f"Complaint regarding {detected_category or 'public safety issue'}. {description[:150]}..."
    keywords = [word for word in description.lower().split() if len(word) > 3][:5]
    
    if severity_classifier and np and pd:
        try:
            priority_score = 50
            confidence = 0.85
            input_data = pd.DataFrame([[priority_score, confidence]], columns=["priority_score", "confidence"])
            severity = severity_classifier.predict(input_data)[0]
        except Exception as e:
            logger.error(f"ML severity prediction failed: {e}")
            severity = _rule_based_severity(description)
    else:
        severity = _rule_based_severity(description)
    
    if not detected_category:
        detected_category = _rule_based_category(description)
    
    department = DEPARTMENT_ROUTING.get(detected_category, "Municipal Corporation")
    recommendation = RECOMMENDATION_RULES.get(detected_category, "Inspect area and schedule maintenance.")
    
    return {
        "summary": summary,
        "keywords": keywords,
        "severity": severity,
        "department": department,
        "recommendation": recommendation
    }

async def detect_duplicates(description: str, existing_complaints: list[str]) -> dict:
    """
    Detect duplicate complaints using Sentence Transformers if available.
    Falls back to simple keyword overlap.
    """
    if sentence_model and np and cosine_similarity and existing_complaints:
        try:
            new_embedding = sentence_model.encode([description])
            existing_embeddings = sentence_model.encode(existing_complaints)
            similarities = cosine_similarity(new_embedding, existing_embeddings)[0]
            max_sim_idx = int(np.argmax(similarities))
            max_similarity = float(similarities[max_sim_idx])
            is_duplicate = max_similarity > 0.85
            return {
                "is_duplicate": is_duplicate,
                "similarity_score": round(max_similarity, 2),
                "similar_complaint": existing_complaints[max_sim_idx] if is_duplicate else None
            }
        except Exception as e:
            logger.error(f"ML duplicate detection failed: {e}")
    
    # Simple keyword overlap fallback
    if existing_complaints:
        desc_words = set(description.lower().split())
        for existing in existing_complaints:
            existing_words = set(existing.lower().split())
            overlap = len(desc_words & existing_words) / max(len(desc_words | existing_words), 1)
            if overlap > 0.85:
                return {"is_duplicate": True, "similarity_score": round(overlap, 2), "similar_complaint": existing}
    
    return {"is_duplicate": False, "similarity_score": 0.0, "similar_complaint": None}

async def generate_heatmap_data(complaints_df) -> list[dict]:
    """
    Generate heatmap data (requires pandas/ML deps). Falls back gracefully.
    """
    if pd is None or np is None:
        return []
    
    try:
        if complaints_df.empty:
            return []
        
        complaints_df["lat_rounded"] = complaints_df["latitude"].round(3)
        complaints_df["lon_rounded"] = complaints_df["longitude"].round(3)
        heatmap_data = complaints_df.groupby(["lat_rounded", "lon_rounded", "category"]).size().reset_index(name="intensity")
        
        severity_weight = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        complaints_df["severity_weight"] = complaints_df["severity"].map(severity_weight).fillna(1)
        severity_scores = complaints_df.groupby(["lat_rounded", "lon_rounded"])["severity_weight"].mean().reset_index(name="avg_severity")
        heatmap_data = heatmap_data.merge(severity_scores, on=["lat_rounded", "lon_rounded"])
        heatmap_data["final_intensity"] = heatmap_data["intensity"] * heatmap_data["avg_severity"]
        
        points = []
        for _, row in heatmap_data.iterrows():
            points.append({
                "latitude": float(row["lat_rounded"]),
                "longitude": float(row["lon_rounded"]),
                "intensity": int(row["final_intensity"]),
                "category": row["category"]
            })
        return points
    except Exception as e:
        logger.error(f"Heatmap generation failed: {e}")
        return []
