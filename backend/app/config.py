"""Application settings, loaded from the .env file in the backend/ folder."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Paths used elsewhere in the app (kept here so every module agrees on them).
APP_DIR = Path(__file__).resolve().parent
MODEL_DIR = APP_DIR / "model"
DATABASE_PATH = APP_DIR.parent / "smartchef.db"


class Settings(BaseSettings):
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # tokens stay valid for a week

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(env_file=APP_DIR.parent / ".env", extra="ignore")


# A single shared settings instance, imported by other modules.
settings = Settings()
