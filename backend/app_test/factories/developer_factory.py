from typing import Any, Protocol

import pytest

from backend.accounts import User, UserManager
from backend.developer import DeveloperProfile, DeveloperProfileService
from app_test.fakes import FakeStorage


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
        self,
        *,
        storage: FakeStorage | None = None,
        user_manager: UserManager | Any | None = None,
    ) -> DeveloperProfileService: ...


@pytest.fixture
def make_developer_profile_service(
    db_session, user_manager: UserManager
) -> MakeDeveloperProfileService:
    default_user_manager = user_manager

    def make(
        *,
        storage: FakeStorage | None = None,
        user_manager: UserManager | Any | None = None,
    ) -> DeveloperProfileService:
        return DeveloperProfileService(
            session=db_session,
            storage=storage or FakeStorage(),  # type: ignore[arg-type]
            user_manager=user_manager or default_user_manager,  # type: ignore[arg-type]
        )

    return make
