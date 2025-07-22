from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from contextlib import asynccontextmanager

# Import routers
from app.routers import auth, dashboard, users, finance

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 IMAGE EHR API Starting up...")

    # Test database connection
    try:
        from app.db.context import get_db_cursor

        with get_db_cursor() as cur:
            cur.execute("SELECT 1")
            logger.info("✅ Database connection successful")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")

    yield

    # Shutdown
    logger.info("🛑 IMAGE EHR API Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="IMAGE EHR API",
    description="Electronic Health Record System for IMAGE Social Welfare Organisation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware - Configure for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:5173",  # Vite dev server (if using Vite)
        # Add your production domain here when deploying
        # "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") == "true" else "An error occurred",
        },
    )


# Include routers with proper prefixes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

app.include_router(users.router, prefix="/api/users", tags=["Users"])

app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])

# Static files (for serving uploaded files, if needed)
# Uncomment if you need to serve static files
# if not os.path.exists("static"):
#     os.makedirs("static")
# app.mount("/static", StaticFiles(directory="static"), name="static")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "IMAGE EHR API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        from app.db.context import get_db_cursor

        with get_db_cursor() as cur:
            cur.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "IMAGE EHR API",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": "2025-06-04T00:00:00Z",  # You can use datetime.utcnow().isoformat()
    }


# API Info endpoint
@app.get("/api", tags=["API Info"])
async def api_info():
    """API information and available endpoints"""
    return {
        "name": "IMAGE EHR API",
        "version": "1.0.0",
        "description": "Electronic Health Record System for IMAGE Social Welfare Organisation",
        "endpoints": {
            "auth": "/api/auth",
            "dashboard": "/api/dashboard",
            "users": "/api/users",
        },
        "documentation": {"swagger": "/docs", "redoc": "/redoc"},
    }


# Development server runner
if __name__ == "__main__":
    import uvicorn

    # Get environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "false").lower() == "true"

    logger.info(f"🚀 Starting IMAGE EHR API on {host}:{port}")
    logger.info(f"📚 API Documentation: http://{host}:{port}/docs")
    logger.info(f"🔍 Debug mode: {debug}")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug",
    )
