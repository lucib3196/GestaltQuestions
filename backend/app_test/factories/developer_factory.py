from typing import Any, Protocol
from uuid import uuid4
from app_test.fakes import FakeStorage, FakeUserManager
import pytest

from backend.accounts import User
from backend.developer import DeveloperProfile, DeveloperProfileService
from backend.accounts import UserRoles


class MakeDeveloperProfile(Protocol):
    def __call__(self, user: User, **overrides: Any) -> DeveloperProfile: ...


@pytest.fixture
def make_developer_profile(db_session) -> MakeDeveloperProfile:
    def make(user: User, **overrides) -> DeveloperProfile:
        profile = DeveloperProfile(
            user_id=user.id,
            storage_path=overrides.pop(
                "storage_path",
                f"ucr/developers/{user.id}/",
            ),
            **overrides,
        )
        db_session.add(profile)
        db_session.commit()
        db_session.refresh(profile)
        return profile

    return make


class MakeDeveloperProfileService(Protocol):
    def __call__(
        self, *, storage: None | FakeStorage, user_manager: None | FakeUserManager
    ) -> DeveloperProfileService: ...


@pytest.fixture
def make_developer_profile_service(db_session) -> MakeDeveloperProfileService:
    def make(*, storage=None, user_manager=None) -> DeveloperProfileService:
        if user_manager is None:
            user_manager = FakeUserManager()
            user_manager.roles = [UserRoles.DEVELOPER]

        if storage is None:
            storage = FakeStorage()

        return DeveloperProfileService(
            session=db_session,
            storage=storage,  # type: ignore
            user_manager=user_manager,  # type: ignore
        )

    return make
