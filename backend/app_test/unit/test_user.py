import pytest
from src.model.users import User, UserCreate, UserUpdate
from src.data.user import UserDB
from src.core.logging import logger


# Createa the database session
@pytest.fixture
def user_db(db_session) -> UserDB:
    return UserDB(db_session)


@pytest.fixture
def make_user(user_db: UserDB):
    async def _make_user(**overrides) -> User:
        defaults = {
            "first_name": "Luciano",
            "last_name": "Bermudez",
            "username": "luci123",
            "email": "luci123@gmail.com",
            "username": None,
            "password": "1234",
        }

        data = UserCreate(**(defaults | overrides))  # type: ignore
        user = await user_db.create_user(data)

        assert user is not None
        return user

    return _make_user


@pytest.mark.asyncio
async def test_user_create(make_user):
    user = await make_user()
    logger.info("Created user %s", user)
    assert user


@pytest.mark.asyncio
async def test_get_user(user_db, make_user):
    cuser = await make_user()
    ruser = await user_db.get_user(cuser.id)
    assert ruser
    assert cuser == ruser


@pytest.mark.asyncio
async def test_get_user_by_email(make_user, user_db):
    cuser = await make_user()
    ruser = await user_db.get_user_by_email(cuser.email)
    assert cuser == ruser


@pytest.mark.asyncio
async def test_delete_user(make_user, user_db):
    cuser = await make_user()
    await user_db.delete_user(cuser.id)
    ruser = await user_db.get_user(cuser.id)
    assert ruser is None


@pytest.mark.asyncio
async def test_update_user(make_user, user_db):
    update_data = UserUpdate(
        username="My new username",
        email="newEmail@gmail.com",
    )
    cuser = await make_user()
    update = await user_db.update_user(
        cuser.id,
        data=update_data,
    )
    assert update
    assert update.id == cuser.id
    logger.debug("This is the created user", update)
