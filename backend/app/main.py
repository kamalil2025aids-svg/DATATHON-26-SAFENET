"""
SafeNet - AI Smart City Safety Intelligence Platform
FastAPI Application Entry Point

This module initializes the FastAPI application, includes all routers,
configures middleware, and sets up exception handlers.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.routers import auth, complaints, ai, dashboard, notifications, tracking, escalation, recommendations
from app.utils.exceptions import SafeNetException

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    logger.info("Initializing SafeNet Platform...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization failed (will retry on first request): {e}")
    yield
    logger.info("Shutting down SafeNet Platform...")

# Initialize FastAPI app
app = FastAPI(
    title="SafeNet API",
    description="AI-Powered Smart City Safety Intelligence Platform Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handler
@app.exception_handler(SafeNetException)
async def safenet_exception_handler(request: Request, exc: SafeNetException):
    logger.error(f"SafeNet Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "code": exc.error_code},
    )

# Include Routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(tracking.router)
app.include_router(escalation.router)
app.include_router(recommendations.router)

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint for health check."""
    return {"status": "ok", "service": "SafeNet API", "version": "1.0.0"}
