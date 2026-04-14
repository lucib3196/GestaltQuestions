from functools import lru_cache
from typing import Annotated
from pathlib import Path
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette import status

from firebase_admin.auth import verify_id_token

from src.core import SessionDep, logger
from src.core.config import AppSettings, get_settings
from src.data import QuestionDB
from src.service.storage.firebase_storage import FbStorage
from src.service.storage.local_storage import LocalStorage
from src.service.question_manager.question_manager import QuestionManager
from src.service.storage.local_storage import Storage
from src.service.user.user_manager import UserManager
from src.app_types.general import STORAGE_TYPE


def get_app_settings() -> AppSettings:
    return get_settings()


SettingDependency = Annotated[AppSettings, Depends(get_app_settings)]


def get_storage_type(
    settings: SettingDependency,
) -> STORAGE_TYPE:
    return settings.STORAGE_SERVICE


StorageTypeDep = Annotated[STORAGE_TYPE, Depends(get_storage_type)]


def get_local_base_path(settings: SettingDependency):
    if settings == "local":
        return "questions"


LocalBaseDep = Annotated[str, Depends(get_local_base_path)]

bearer_scheme = HTTPBearer(auto_error=False)


def get_firebase_token(
    token: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict | None:
    try:
        if not token:
            raise ValueError("No Token")
        return verify_id_token(token.credentials)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Not logged in or Invalid credentials {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
FireBaseToken = Annotated[dict, Depends(get_firebase_token)]


def get_current_user_id(
    token: FireBaseToken,
) -> str:
    try:
        user_id = token.get("user_id", None)
        if user_id is None:
            raise HTTPException(
                detail="Failed to retrieve signed in user",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            detail=f"Failed to retrieve signed in user {e}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


CurrentUser = Annotated[str, Depends(get_current_user_id)]


def get_question_database(
    session: SessionDep,
) -> QuestionDB:
    return QuestionDB(session)


QuestionDBDependency = Annotated[QuestionDB, Depends(get_question_database)]


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


@lru_cache
def get_question_manager(
    qdb: QuestionDBDependency,
    storage: StorageDependency,
    storage_type: StorageTypeDep,
):
    return QuestionManager(qdb, storage, storage_type)


QuestionManagerDependency = Annotated[QuestionManager, Depends(get_question_manager)]


def get_user_database(session: SessionDep) -> UserManager:
    return UserManager(session)


UserManagerDependeny = Annotated[UserManager, Depends(get_user_database)]
