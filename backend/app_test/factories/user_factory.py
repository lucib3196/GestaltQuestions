from typing import Any, Protocol
from uuid import uuid4

import pytest

from backend.accounts import User
from backend.developer import DeveloperProfile


class MakeUser(Protocol):
    def __call__(self, **overrides: Any) -> User: ...


@pytest.fixture
def make_user(db_session) -> MakeUser:
    def make(**overrides) -> User:
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
