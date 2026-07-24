"""
AI NLP Service for SafeNet.
Handles text analysis, severity prediction, duplicate detection, and recommendations.
Uses Sentence Transformers, Scikit-learn, Pandas, and NumPy.
"""

import logging
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)

# Load Sentence Transformer model for embeddings
try:
    sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
    logger.info("Sentence Transformer model loaded.")
except Exception as e:
    logger.error(f"Failed to load Sentence Transformer: {e}")
    sentence_model = None

# Mock trained severity classifier (in production, load from joblib)
severity_encoder = LabelEncoder()
severity_encoder.fit(["Low", "Medium", "High", "Critical"])

# Initialize Random Forest for severity prediction
# In production, this would be pre-trained on historical complaint data
severity_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
# Mock training data
mock_severity_data = pd.DataFrame({
    "priority_score": [30, 50, 70, 90, 40, 60, 80, 95],
    "confidence": [0.8, 0.85, 0.9, 0.95, 0.75, 0.82, 0.88, 0.96],
    "severity": ["Low", "Medium", "High", "Critical", "Low", "Medium", "High", "Critical"]
})
severity_classifier.fit(
    mock_severity_data[["priority_score", "confidence"]],
    mock_severity_data["severity"]
)

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

# Recommendation engine rules
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

async def analyze_text(description: str, detected_category: str = None) -> dict:
    """
    Analyze complaint text using NLP.
    Extracts keywords, generates summary, and predicts severity.
    """
    # Generate summary (simplified - in production use GPT-4/Gemini)
    summary = f"Complaint regarding {detected_category or 'public safety issue'}. {description[:150]}..."
    
    # Extract keywords using simple NLP
    keywords = [word for word in description.lower().split() if len(word) > 3][:5]
    
    # Predict severity using Random Forest
    priority_score = 50  # Default
    confidence = 0.85
    severity = predict_severity(priority_score, confidence)
    
    # Determine department
    department = DEPARTMENT_ROUTING.get(detected_category, "Municipal Corporation")
    
    # Generate recommendation
    recommendation = RECOMMENDATION_RULES.get(detected_category, "Inspect area and schedule maintenance.")
    
    return {
        "summary": summary,
        "keywords": keywords,
        "severity": severity,
        "department": department,
        "recommendation": recommendation
    }

def predict_severity(priority_score: int, confidence: float) -> str:
    """Predict severity using the trained Random Forest classifier."""
    try:
        input_data = pd.DataFrame([[priority_score, confidence]], columns=["priority_score", "confidence"])
        prediction = severity_classifier.predict(input_data)
        return prediction[0]
    except Exception as e:
        logger.error(f"Severity prediction failed: {e}")
        return "Medium"

async def detect_duplicates(description: str, existing_complaints: list[str]) -> dict:
    """
    Detect duplicate complaints using Sentence Transformers and Cosine Similarity.
    Returns duplicate status and similarity score.
    """
    if not sentence_model or not existing_complaints:
        return {"is_duplicate": False, "similarity_score": 0.0, "similar_complaint": None}
    
    try:
        # Encode the new complaint
        new_embedding = sentence_model.encode([description])
        
        # Encode existing complaints
        existing_embeddings = sentence_model.encode(existing_complaints)
        
        # Calculate cosine similarity
        similarities = cosine_similarity(new_embedding, existing_embeddings)[0]
        
        max_sim_idx = np.argmax(similarities)
        max_similarity = float(similarities[max_sim_idx])
        
        # Threshold for duplicate detection (85% similarity)
        is_duplicate = max_similarity > 0.85
        
        return {
            "is_duplicate": is_duplicate,
            "similarity_score": round(max_similarity, 2),
            "similar_complaint": existing_complaints[max_sim_idx] if is_duplicate else None
        }
        
    except Exception as e:
        logger.error(f"Duplicate detection failed: {e}")
        return {"is_duplicate": False, "similarity_score": 0.0, "similar_complaint": None}

async def generate_heatmap_data(complaints_df: pd.DataFrame) -> list[dict]:
    """
    Generate heatmap data from complaints using Pandas and NumPy.
    Groups complaints by location and calculates intensity.
    """
    if complaints_df.empty:
        return []
    
    try:
        # Group by approximate location (rounded to 3 decimal places for clustering)
        complaints_df["lat_rounded"] = complaints_df["latitude"].round(3)
        complaints_df["lon_rounded"] = complaints_df["longitude"].round(3)
        
        # Group by location and category
        heatmap_data = complaints_df.groupby(["lat_rounded", "lon_rounded", "category"]).size().reset_index(name="intensity")
        
        # Calculate severity weight
        severity_weight = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        complaints_df["severity_weight"] = complaints_df["severity"].map(severity_weight).fillna(1)
        severity_scores = complaints_df.groupby(["lat_rounded", "lon_rounded"])["severity_weight"].mean().reset_index(name="avg_severity")
        
        # Merge intensity and severity
        heatmap_data = heatmap_data.merge(severity_scores, on=["lat_rounded", "lon_rounded"])
        
        # Calculate final intensity score (intensity * avg_severity)
        heatmap_data["final_intensity"] = heatmap_data["intensity"] * heatmap_data["avg_severity"]
        
        # Convert to list of dicts
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