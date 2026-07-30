from functools import lru_cache
from typing import Annotated, Literal

from fastapi import Depends

from backend.core import logger
from backend.core.config import get_settings
from backend.storage import STORAGE_TYPE, FbStorage, LocalStorage, Storage

from .core import SettingDependency


def get_storage_type(
    settings: SettingDependency,
) -> Literal["cloud", "local"]:
    return settings.STORAGE_SERVICE


StorageTypeDep = Annotated[STORAGE_TYPE, Depends(get_storage_type)]


@lru_cache
def get_storage_manager() -> Storage:
    settings = get_settings()
    if settings.STORAGE_SERVICE == "cloud":
        if not (settings.FIREBASE_CRED and settings.STORAGE_BUCKET):
            raise ValueError("Settings for Cloud Storage not Set")
        storage_service = FbStorage(
            bucket=settings.STORAGE_BUCKET,
        )
    else:
        storage_service = LocalStorage()

    logger.debug(f"Question manager set to {settings.STORAGE_SERVICE}")
    logger.debug("Initialized Question Manager Success")

    return storage_service


StorageDependency = Annotated[Storage, Depends(get_storage_manager)]

__all__ = [
    "StorageDependency",
    "StorageTypeDep",
    "get_storage_manager",
    "get_storage_type",
]
