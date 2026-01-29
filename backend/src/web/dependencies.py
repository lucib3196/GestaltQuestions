from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette import status

from firebase_admin.auth import verify_id_token
from src.core import SessionDep
from src.core.config import AppSettings, get_settings
from src.data import QuestionDB
from src.service import QuestionManager, StorageDependency
from src.types import STORAGE_TYPE


@lru_cache
def get_app_settings() -> AppSettings:
    return get_settings()


SettingDependency = Annotated[AppSettings, Depends(get_app_settings)]


@lru_cache
def get_storage_type(
    settings: SettingDependency,
) -> STORAGE_TYPE:
    return settings.STORAGE_SERVICE


StorageTypeDep = Annotated[STORAGE_TYPE, Depends(get_storage_type)]


bearer_scheme = HTTPBearer(auto_error=False)


def get_firebase_user_from_token(
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


FireBaseToken = Annotated[dict, Depends(get_firebase_user_from_token)]


def get_question_database(session: SessionDep) -> QuestionDB:
    return QuestionDB(session)


QuestionDBDependency = Annotated[QuestionDB, Depends(get_question_database)]


@lru_cache
def get_question_manager(
    qdb: QuestionDBDependency,
    storage: StorageDependency,
    storage_type: StorageTypeDep,
):
    return QuestionManager(qdb, storage, storage_type)


QuestionManagerDependency = Annotated[QuestionManager, Depends(get_question_manager)]
