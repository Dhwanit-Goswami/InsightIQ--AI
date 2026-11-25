from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_NAME: str = "AI Decision Intelligence Platform API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str
    SECRET_KEY: str
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    API_V1_PREFIX: str = "/api/v1"

    # Email (password reset) — optional; falls back to console logging
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@insightiq.ai"
    FRONTEND_URL: str = "http://localhost:5173"

    # LLM Integration — optional; falls back to deterministic engine
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        v = parsed
                except Exception:
                    pass
            else:
                v = [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, list):
            # Normalize origins and exclude wildcard '*' to prevent insecure credentialed CORS
            origins = [str(i).strip().rstrip("/") for i in v if str(i).strip() and str(i).strip() != "*"]
            return origins
        return []

    @model_validator(mode="after")
    def validate_cors_origins(self) -> "Settings":
        """
        In development mode, ensure both localhost and 127.0.0.1 are present
        to avoid local cross-origin development discrepancies.
        In production, preserve strictly the origins specified via environment variables.
        """
        if self.APP_ENV == "development" or self.DEBUG:
            dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
            current_origins = list(self.CORS_ORIGINS)
            for origin in dev_origins:
                if origin not in current_origins:
                    current_origins.append(origin)
            self.CORS_ORIGINS = current_origins
        return self


settings = Settings()
