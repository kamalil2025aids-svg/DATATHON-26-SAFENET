"""
Pydantic schemas for request/response validation.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "citizen"
    department: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: str
    department: str | None
    trust_score: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Complaint Schemas ---
class ComplaintBase(BaseModel):
    description: str
    latitude: float
    longitude: float
    address: str | None = None

class ComplaintCreate(ComplaintBase):
    image_url: str | None = None
    video_url: str | None = None
    voice_url: str | None = None

class ComplaintResponse(ComplaintBase):
    id: uuid.UUID
    ticket_id: str
    user_id: uuid.UUID
    image_url: str | None
    video_url: str | None
    voice_url: str | None
    status: str
    severity: str | None
    category: str | None
    department: str | None
    ai_summary: str | None
    confidence_score: float
    priority_score: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ComplaintStatusUpdate(BaseModel):
    status: str
    notes: str | None = None

# --- AI Schemas ---
class AIAnalysisResponse(BaseModel):
    category: str
    severity: str
    confidence: float
    department: str
    estimated_time: str
    priority: int
    summary: str
    keywords: list[str]
    recommendations: list[str]

# --- Dashboard Schemas ---
class DashboardStats(BaseModel):
    total_complaints: int
    pending: int
    resolved: int
    in_progress: int
    avg_response_time: str
    citizen_satisfaction: float

class HeatmapPoint(BaseModel):
    latitude: float
    longitude: float
    intensity: int
    category: str