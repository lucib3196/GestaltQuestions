from typing import Any, Protocol
from uuid import uuid4

import pytest

from backend.accounts import User
from backend.developer import DeveloperProfile


class MakeUser(Protocol):
    def __call__(self, **overrides: Any) -> User: ...


class MakeDeveloperProfile(Protocol):
    def __call__(self, user: User, **overrides: Any) -> DeveloperProfile: ...


@pytest.fixture
def make_user(db_session) -> MakeUser:
    def make(**overrides):
        user = User(
            id=overrides.pop("id", uuid4()),
            first_name=overrides.pop("first_name", "Test"),
            last_name=overrides.pop("last_name", "User"),
            email=overrides.pop("email", f"{uuid4()}@example.com"),
            **overrides,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return make


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
