"""
AI Service module for SafeNet.
Handles image analysis, text analysis, severity prediction, 
department classification, and summary generation.
"""

import random
import logging

logger = logging.getLogger(__name__)

# Mock AI classification database
HAZARD_CATEGORIES = [
    "Road Damage", "Pothole", "Streetlight Damage", "Garbage", 
    "Water Leakage", "Broken Pipe", "Traffic Congestion", "Accident",
    "Flood", "Fire", "Fallen Tree", "Electric Pole Damage", 
    "Illegal Dumping", "Open Manhole", "Animal Hazard"
]

DEPARTMENT_MAP = {
    "Road Damage": "Municipal Corporation",
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
    "Animal Hazard": "Animal Control"
}

RECOMMENDATIONS_MAP = {
    "Road Damage": ["Install speed breaker", "Repair road immediately", "Deploy warning signs"],
    "Pothole": ["Patch pothole", "Deploy warning signs", "Traffic signal adjustment"],
    "Streetlight Damage": ["Replace LED bulb", "Schedule maintenance", "Temporary lighting"],
    "Garbage": ["Increase waste collection", "Install smart dustbins", "Awareness campaign"],
    "Water Leakage": ["Repair pipeline", "Water pump deployment", "Traffic diversion"],
    "Traffic Congestion": ["Deploy traffic police", "Signal optimization", "Route diversion"],
    "Accident": ["Dispatch ambulance", "CCTV installation", "Traffic patrol"],
    "Flood": ["Improve drainage", "Deploy water pumps", "Evacuation alert"],
    "Fire": ["Dispatch fire brigade", "Evacuate area", "Cut electricity supply"],
}

async def analyze_complaint(description: str, image_url: str | None = None) -> dict:
    """
    Analyze complaint using AI (Mock implementation).
    In production, this would call OpenAI GPT-4, YOLOv8, or Gemini.
    """
    logger.info(f"Analyzing complaint: {description[:50]}...")
    
    # Simulate AI processing delay
    import asyncio
    await asyncio.sleep(0.5)
    
    # Mock category detection based on keywords
    description_lower = description.lower()
    detected_category = "Road Damage"  # Default
    
    for category in HAZARD_CATEGORIES:
        if category.lower() in description_lower:
            detected_category = category
            break
    
    # Mock severity prediction
    severity = random.choice(["Low", "Medium", "High", "Critical"])
    confidence = round(random.uniform(0.75, 0.99), 2)
    priority = random.randint(30, 95)
    
    # Department routing
    department = DEPARTMENT_MAP.get(detected_category, "Municipal Corporation")
    
    # Estimated resolution time based on severity
    time_map = {"Low": "24-48h", "Medium": "12-24h", "High": "6-12h", "Critical": "1-4h"}
    estimated_time = time_map[severity]
    
    # Generate summary
    summary = f"Detected {detected_category} issue. {description}. Routed to {department}."
    
    # Extract keywords
    keywords = [word for word in description_lower.split() if len(word) > 3][:5]
    
    # Get recommendations
    recommendations = RECOMMENDATIONS_MAP.get(detected_category, ["Inspect area", "Schedule maintenance"])
    
    return {
        "category": detected_category,
        "severity": severity,
        "confidence": confidence,
        "department": department,
        "estimated_time": estimated_time,
        "priority": priority,
        "summary": summary,
        "keywords": keywords,
        "recommendations": recommendations
    }