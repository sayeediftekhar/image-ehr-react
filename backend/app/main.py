from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import get_settings

def create_app() -> FastAPI:
    cfg = get_settings()
    app = FastAPI(title=cfg.APP_NAME)

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(SessionMiddleware, secret_key=cfg.SECRET_KEY)
    app.mount("/static", StaticFiles(directory="static"), name="static")

    # Include routers
    from app.routers import auth, dashboard, health, admin, billing, patients, visits
    
    app.include_router(patients.router)
    app.include_router(auth.router)
    app.include_router(dashboard.router)
    app.include_router(health.router)
    app.include_router(admin.router)
    app.include_router(billing.router)
    app.include_router(visits.router)

    return app

app = create_app()

# Add patients router
from app.routers import patients
app.include_router(patients.router, tags=["patients"])

# Add patients router
from app.routers import patients
app.include_router(patients.router, tags=["patients"])
