from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from backend.core.config import AppSettings, get_settings
from backend.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def get_app_settings() -> AppSettings:
    return get_settings()


SettingDependency = Annotated[AppSettings, Depends(get_app_settings)]

__all__ = ["SessionDep", "SettingDependency", "get_app_settings", "get_session"]
