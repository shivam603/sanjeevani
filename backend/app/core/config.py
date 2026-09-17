"""Application configuration settings for Sanjeevani."""

from typing import List, Union
import os
from pydantic import AnyHttpUrl, field_validator
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    # Fallback if pydantic_settings is being installed
    from pydantic import BaseModel as BaseSettings  # type: ignore
    SettingsConfigDict = dict  # type: ignore


class Settings(BaseSettings):
    """Configuration settings loaded from environment variables."""

    # Project Metadata
    PROJECT_NAME: str = "Sanjeevani API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # CORS configuration from environment, with localhost and Vite defaults
    CORS_ORIGINS: Union[List[str], str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    # Database Settings
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "sanjeevani")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "sanjeevani_secret")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "sanjeevani_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql+asyncpg://{os.getenv('POSTGRES_USER', 'sanjeevani')}:{os.getenv('POSTGRES_PASSWORD', 'sanjeevani_secret')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'sanjeevani_db')}",
    )
    SYNC_DATABASE_URL: str = os.getenv(
        "SYNC_DATABASE_URL",
        f"postgresql://{os.getenv('POSTGRES_USER', 'sanjeevani')}:{os.getenv('POSTGRES_PASSWORD', 'sanjeevani_secret')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'sanjeevani_db')}",
    )

    # Redis Queue & Cache
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_URL: str = os.getenv("REDIS_URL", f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/0")

    # Security & JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_key_for_sanjeevani_platform_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Stage 5 Consent Mechanism
    CONSENT_SECRET_KEY: str = os.getenv("CONSENT_SECRET_KEY", "consent_master_secret_hmac_key_2026")
    CONSENT_DEFAULT_TTL_DAYS: int = 30

    # Stage 4 Explanation Layer Settings
    EXPLANATION_LLM_PROVIDER: str = os.getenv("EXPLANATION_LLM_PROVIDER", "watsonx")
    IBM_WATSONX_APIKEY: str = os.getenv("IBM_WATSONX_APIKEY", "")
    IBM_WATSONX_PROJECT_ID: str = os.getenv("IBM_WATSONX_PROJECT_ID", "")
    IBM_WATSONX_URL: str = os.getenv("IBM_WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    IBM_WATSONX_MODEL_ID: str = os.getenv("IBM_WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL_ID: str = os.getenv("OPENAI_MODEL_ID", "gpt-4o-mini")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
