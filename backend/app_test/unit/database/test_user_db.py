import pytest
import src.api.database.user as user_db
import src.api.database.question as question_db
from src.api.core import logger
from src.api.db_models.users import User, UserRoles, UserBase, UserUpdate


@pytest.fixture
def user_data():
    return UserBase(
        first_name="Luciano",
        last_name="Bermudez",
        username="luci123",
        email="luci123@gmail.com",
        fb_id="1234",
    )


@pytest.fixture
def create_user(user_data, db_session):
    user = user_db.create_user(
        user_data,
        session=db_session,
    )
    return user


def test_user_create(create_user):
    user = create_user
    user.role
    assert user


def test_get_user(create_user, db_session):
    cuser = create_user
    ruser = user_db.get_user(cuser.id, db_session)
    assert ruser
    assert cuser == ruser


def test_get_user_by_email(create_user, user_data, db_session):
    cuser = create_user
    ruser = user_db.get_user_by_email(user_data.email, db_session)
    assert cuser == ruser


def test_get_user_by_fb(create_user, user_data, db_session):
    cuser = create_user
    ruser = user_db.get_user_by_fb(user_data.fb_id, db_session)
    assert cuser == ruser


def test_delete_user(create_user, db_session):
    cuser = create_user
    user_db.delete_user(cuser.id, db_session)
    ruser = user_db.get_user(cuser.id, db_session)
    assert ruser is None


def test_update_user(create_user, db_session):
    update_data = UserUpdate(
        username="My new username",
        email="newEmail@gmail.com",
    )
    cuser = create_user
    update = user_db.update_user(cuser.id, data=update_data, session=db_session)
    assert update
    assert update.id == cuser.id
    print("This is the created user", update)


@pytest.mark.asyncio
async def test_set_user_question(create_user, question_payload_full_dict, db_session):
    qcreated = await question_db.create_question(question_payload_full_dict, db_session)
    user_db.set_user_created_questions(create_user.id, qcreated, db_session)
    result = user_db.get_user_created_questions(create_user.id, db_session)
    print(f"These are the results {result}")
    assert result


@pytest.mark.asyncio
async def test_set_user_questions(create_user, question_payload_full_dict, db_session):
    for _ in range(3):
        qcreated = await question_db.create_question(
            question_payload_full_dict, db_session
        )
        user_db.set_user_created_questions(create_user.id, qcreated, db_session)
    result = user_db.get_user_created_questions(create_user.id, db_session)

    print(f"These are the results {result}")
    assert result
    assert len(result) == 3
