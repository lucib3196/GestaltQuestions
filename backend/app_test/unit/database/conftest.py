from app_test.factories import make_question, make_user, make_submission_attempt


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
