"""
Application configuration settings.
Uses Pydantic BaseSettings for environment variable management.
Supports Render and Vercel deployment environments.
"""

import json
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SafeNet"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database - defaults to local; use Render Postgres in production
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/safenet"
    
    # Redis - optional; graceful fallback if not available
    REDIS_URL: str = ""
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS - supports JSON string from env (Render) or Python list
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://safenet-app.vercel.app"
    ]
    
    # Cloudinary (optional for hackathon - images can use local storage)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS if it's a JSON string from environment variable
        cors_env = os.environ.get("CORS_ORIGINS")
        if cors_env:
            try:
                self.CORS_ORIGINS = json.loads(cors_env)
            except (json.JSONDecodeError, TypeError):
                self.CORS_ORIGINS = [cors_env]
        
        # Fix DATABASE_URL for Render: Render provides postgres:// but we need postgresql+asyncpg://
        db_url = os.environ.get("DATABASE_URL", self.DATABASE_URL)
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        self.DATABASE_URL = db_url

settings = Settings()
