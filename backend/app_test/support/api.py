from contextlib import asynccontextmanager

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.deps import (
    get_session,
    get_storage_manager,
    get_storage_type,
    get_user_mng,
)
from backend.api.developer.dependencies import get_developer_profile_service
from backend.developer.profiles import DeveloperProfileService
from src.main import get_application


@asynccontextmanager
async def on_startup_test(app: FastAPI):
    yield


# @pytest.fixture
# def user_manager_api(db_session) -> UserManager:
#     return UserManager(db_session)


@pytest.fixture(scope="function")
def api_client(db_session, user_manager, raw_storage):

    app = get_application()
    app.router.lifespan_context = on_startup_test

    def override_get_db():
        yield db_session

    def override_get_user_manager():
        return user_manager

    def override_get_developer_profile_service():
        return DeveloperProfileService(
            session=db_session,
            storage=raw_storage,
            user_manager=user_manager,
        )

    def override_get_storage():
        return raw_storage

    def override_get_storage_type():
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
