import pytest
from src.api.database import question as qdb
from src.api.database.models.question import QuestionData
from src.api.database.models.users import (
    UserBase,
)
import src.api.database.user as user_db


@pytest.fixture
def make_user(db_session):
    def make(
        *,
        session=db_session,
        **overrides,
    ):
        defaults = {
            "first_name": "Luciano",
            "last_name": "Bermudez",
            "username": "luci123",
            "email": "luci123@gmail.com",
            "fb_id": "1234",
        }

        data = UserBase(**(defaults | overrides))  # type: ignore
        return user_db.create_user(data, session)

    return make


@pytest.fixture
def make_question(db_session):
    async def make(
        *,
        session=db_session,
        **overrides,
    ):
        defaults = {
            "title": "Sample Question",
            "ai_generated": True,
            "isAdaptive": False,
        }

        data = QuestionData(**(defaults | overrides))
        return await qdb.create_question(data, session)

    return make


# @pytest.fixture
# def combined_payload(question_payload, question_payload_2):
#     return [question_payload, question_payload_2]


# @pytest.fixture
# @pytest.mark.asyncio
# async def create_question_with_relationship(
#     db_session, question_payload, relationship_payload
# ):
#     qdata = QuestionData(**question_payload, **relationship_payload)
#     qcreated = await qdb.create_question(qdata, db_session)
#     assert qcreated
#     return qcreated


# @pytest.fixture
# @pytest.mark.asyncio
# async def create_question(db_session, question_payload):
#     qdata = QuestionData(**question_payload)
#     qcreated = await qdb.create_question(qdata, db_session)
#     assert qcreated
#     return qcreated


# @pytest.fixture
# def user_data():
#     return UserBase(
#         first_name="Luciano",
#         last_name="Bermudez",
#         username="luci123",
#         email="luci123@gmail.com",
#         fb_id="1234",
#     )


# @pytest.fixture
# def create_user(user_data, db_session):
#     user = user_db.create_user(
#         user_data,
#         session=db_session,
#     )
#     return user
