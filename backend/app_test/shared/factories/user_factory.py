import pytest
from backend.auth import User
from uuid import uuid4
from backend.developer import DeveloperProfile

@pytest.fixture
def make_user(db_session):
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
def make_developer_profile(db_session):
    def make(user: User, **overrides):
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