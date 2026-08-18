from types import SimpleNamespace
from uuid import uuid4

import pytest

from app_test.fakes import FakeStorage, FakeUserManager
from backend.accounts import (
    UserRoles,
)
from backend.authorization import ProfileOperationError
from backend.developer import DeveloperProfile, DeveloperProfileService


@pytest.fixture
def fake_storage():
    return FakeStorage()


@pytest.fixture
def fake_user_manager():
    return FakeUserManager()


@pytest.fixture
def developer_profile_service(make_developer_profile_service):
    return make_developer_profile_service()


@pytest.mark.asyncio
async def test_generate_storage_path_uses_institution_slug(
    developer_profile_service: DeveloperProfileService,
    fake_user_manager,
) -> None:
    fake_user_manager.user = SimpleNamespace(id="abc-123")
    fake_user_manager.institution = SimpleNamespace(name="Cool School @ West")
    path = await developer_profile_service.generate_storage_path("abc-123")
    assert path == "cool_school_west/developers/abc-123/"


@pytest.mark.asyncio
async def test_generate_storage_path_raises_when_institution_missing(
    developer_profile_service: DeveloperProfileService,
    fake_user_manager,
) -> None:
    fake_user_manager.user = SimpleNamespace(id="abc-123")
    fake_user_manager.institution = None

    with pytest.raises(ProfileOperationError):
        await developer_profile_service.generate_storage_path("abc-123")


@pytest.mark.asyncio
async def test_set_developer_data_creates_profile_with_storage_path(
    developer_profile_service: DeveloperProfileService,
    fake_user_manager,
    db_session,
) -> None:
    user_id = uuid4()
    fake_user_manager.user = SimpleNamespace(id=user_id)
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]
    fake_user_manager.institution = SimpleNamespace(name="CPP")

    profile = await developer_profile_service.set_profile(user_id)

    assert isinstance(profile, DeveloperProfile)
    assert str(profile.user_id) == str(user_id)
    assert profile.storage_path == f"cpp/developers/{user_id}/"


@pytest.mark.asyncio
async def test_get_developer_data_returns_existing_profile(
    developer_profile_service: DeveloperProfileService,
    fake_user_manager,
    db_session,
) -> None:
    user_id = uuid4()
    fake_user_manager.user = SimpleNamespace(id=user_id)
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    profile = DeveloperProfile(
        user_id=user_id,
        storage_path="cpp/developers/abc-123/",
    )
    db_session.add(profile)
    db_session.commit()

    result = await developer_profile_service.get_profile(user_id)

    assert result is not None
    assert result.storage_path == "cpp/developers/abc-123/"
