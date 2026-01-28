import pytest
from src.database.models.users import User, UserBase
from src.database import UserDB

@pytest.fixture
def make_user(user_db: UserDB):
    async def _make_user(**overrides) -> User:
        defaults = {
            "first_name": "Luciano",
            "last_name": "Bermudez",
            "username": "luci123",
            "email": "luci123@gmail.com",
            "fb_id": "1234",
        }

        data = UserBase(**(defaults | overrides)) # type: ignore
        user = await user_db.create_user(data)

        assert user is not None
        return user

    return _make_user
