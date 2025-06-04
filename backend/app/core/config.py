from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database settings
    database_url: str = (
        "postgresql://neondb_owner:npg_Odu71XQLEtJr@ep-wild-feather-a1h8usnt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )

    # For backward compatibility
    POSTGRES_DSN: str = (
        "postgresql://neondb_owner:npg_Odu71XQLEtJr@ep-wild-feather-a1h8usnt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )

    # JWT settings
    secret_key: str = (
        "your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # App settings
    app_name: str = "IMAGE EHR API"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"


def get_settings():
    return Settings()
