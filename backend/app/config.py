import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Centralised Student Analysis Platform"
    PROJECT_SHORT_NAME: str = "CampusIQ"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite:///./campusiq.db"
    
    # Security
    SECRET_KEY: str = "campusiq-super-secret-development-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    # Policy Thresholds (Configurable)
    ATTENDANCE_THRESHOLD: float = 75.0
    AT_RISK_GPA_THRESHOLD: float = 5.0
    MAX_UPLOAD_MB: int = 10

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
