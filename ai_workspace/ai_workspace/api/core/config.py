# --- Standard Library ---
import os
from pathlib import Path
from functools import lru_cache
from typing import Optional, Literal, Union, Sequence
from pydantic_settings import BaseSettings, SettingsConfigDict

# --- Third-Party ---
from dotenv import load_dotenv
from pydantic import AnyHttpUrl, field_validator
from pydantic_core.core_schema import ValidationInfo
from pydantic_settings import BaseSettings

load_dotenv()

# Points to the root directory adjust as needed
ROOT_PATH = Path(__file__).parents[3]


class AppSettings(BaseSettings):
    PROJECT_NAME: str
    MODE: Literal["testing", "dev", "production"] = "dev"
    BACKEND_CORS_ORIGINS: Sequence[AnyHttpUrl | str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Settings
    DATABASE_URI: Optional[str] = None
    POSTGRES_URL: Optional[str] = None
    SQLITE_DB_PATH: Optional[str] = None

    # Cloud Storage
    FIREBASE_CRED: Optional[str] = None
    STORAGE_BUCKET: Optional[str] = None

    @field_validator("SQLITE_DB_PATH", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> str:
        return v or ":memory:"

    model_config = SettingsConfigDict(
        env_file=ROOT_PATH / ".env", env_nested_delimiter="__", extra="ignore"
    )

    # Static Directory
    ROOT_PATH: Union[str, Path]

    SQLITE_DB_PATH: Optional[str] = None


@lru_cache
def get_settings() -> AppSettings:
    valid_modes = ("testing", "dev", "production")
    env_mode = os.getenv("MODE", "dev")
    if env_mode not in valid_modes:
        raise ValueError(f"Invalid MODE: {env_mode}. Must be one of {valid_modes}")
    allowed_origins = os.getenv("ALLOWED_ORIGINS")
    if allowed_origins:
        allowed_origins = allowed_origins.split(",")
    else:
        allowed_origins = ["http://localhost:5173"]

    app_settings = AppSettings(
        PROJECT_NAME="AI Gestalt",
        BACKEND_CORS_ORIGINS=[] + allowed_origins,
        ROOT_PATH=ROOT_PATH,
        MODE=env_mode,
    )
    return app_settings


if __name__ == "__main__":
    print(get_settings())
