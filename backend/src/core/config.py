import os
from functools import lru_cache
from pathlib import Path
from typing import Literal, Sequence

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

# Points to the root directory adjust as needed
ROOT_PATH = Path(__file__).parents[2]


class AppSettings(BaseSettings):
    PROJECT_NAME: str | None = None
    MODE: Literal["testing", "dev", "production"] = "dev"
    STORAGE_SERVICE: Literal["local", "cloud"] = "local"

    BACKEND_CORS_ORIGINS: Sequence[str] | str = []

    WORKING_DIR: str | Path | None = None

    DATABASE_URI: str | None = None
    POSTGRES_URL: str | None = None
    SQLITE_DB_PATH: str | None = None

    # FIREBASE CONFIG
    FIREBASE_CRED: str | None = None
    STORAGE_BUCKET: str | None = None
    FIREBASE_AUTH_EMULATOR_HOST: str | None = None
    STORAGE_EMULATOR_HOST: str | None = None

    SANDBOX_URL: str | None = None
    PROJECT_ROOT: str | Path

    @field_validator("BACKEND_CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str] | None = None):
        if v is None:
            return []

        if isinstance(v, str):
            raw_cors = [i.strip() for i in v.split(",")]
        else:
            raw_cors = v

        normalized = []
        for r in raw_cors:
            if not r.startswith(("http://", "https://")):
                r = "http://" + r
            normalized.append(r)

        return normalized

    @field_validator("SQLITE_DB_PATH", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None):
        return v or ":memory:"

    model_config = SettingsConfigDict(
        env_file=ROOT_PATH / ".env",
        env_nested_delimiter="__",
        extra="ignore",
    )


@lru_cache
def get_settings() -> AppSettings:
    valid_modes = ("testing", "dev", "production")
    env_mode = os.getenv("MODE", "dev")
    if env_mode not in valid_modes:
        raise ValueError(f"Invalid MODE: {env_mode}. Must be one of {valid_modes}")

    # Verify storage
    if env_mode == "dev":
        auth_emulator = os.getenv("FIREBASE_AUTH_EMULATOR_HOST", None)
        storage_emulator = os.getenv("STORAGE_EMULATOR_HOST", None)

        if auth_emulator is None:
            raise ValueError("Env Mode set to dev. Auth emulator must be set")
        if storage_emulator is None:
            raise ValueError("Env Mode set to dev. Storage emulator must be set")

    app_settings = AppSettings(
        PROJECT_ROOT=ROOT_PATH,
    )
    return app_settings


if __name__ == "__main__":
    print(get_settings())
