from collections.abc import AsyncIterator, Generator
from contextlib import asynccontextmanager

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session

from backend.accounts.users import UserManager
from backend.api.deps import (
    get_session,
    get_storage_manager,
    get_storage_type,
    get_user_mng,
)
from backend.api.developer.dependencies import get_developer_profile_service
from backend.developer.profiles import DeveloperProfileService
from backend.storage import Storage
from src.main import get_application


@asynccontextmanager
async def on_startup_test(_app: FastAPI) -> AsyncIterator[None]:
    yield


# @pytest.fixture
# def user_manager_api(db_session) -> UserManager:
#     return UserManager(db_session)


@pytest.fixture(scope="function")
def api_client(
    db_session: Session,
    user_manager: UserManager,
    raw_storage: Storage,
) -> Generator[TestClient]:
    app = get_application()
    app.router.lifespan_context = on_startup_test

    def override_get_db() -> Generator[Session]:
        yield db_session

    def override_get_user_manager() -> UserManager:
        return user_manager

    def override_get_developer_profile_service() -> DeveloperProfileService:
        return DeveloperProfileService(
            session=db_session,
            storage=raw_storage,
            user_manager=user_manager,
        )

    def override_get_storage() -> Storage:
        return raw_storage

    def override_get_storage_type() -> str:
        return raw_storage.get_storage_type()

    app.dependency_overrides[get_session] = override_get_db
    app.dependency_overrides[get_user_mng] = override_get_user_manager
    app.dependency_overrides[get_developer_profile_service] = (
        override_get_developer_profile_service
    )
    app.dependency_overrides[get_storage_manager] = override_get_storage
    app.dependency_overrides[get_storage_type] = override_get_storage_type

    with TestClient(app, raise_server_exceptions=True) as client:
        yield client

    app.dependency_overrides.clear()
