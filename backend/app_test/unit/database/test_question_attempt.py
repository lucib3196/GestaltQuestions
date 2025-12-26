from src.api.database import question_attempt as qa
import pytest


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "quiz_data,submitted_answer",
    [
        ({"a": 1}, {"a": 1}),
        ({"a": 1, "b": 2}, {"a": 2, "b": 1}),
        ({"x": 0}, {"x": 5}),
    ],
)
async def test_create_attempt(
    make_user, make_question, db_session, quiz_data, submitted_answer
):
    user = make_user()
    question = await make_question()

    attempt = qa.create_attempt(
        question_id=question.id,
        user_id=user.id,
        quiz_data=quiz_data,
        submitted_answer=submitted_answer,
        session=db_session,
    )

    assert attempt is not None
    assert attempt.user_id == user.id
    assert attempt.question_id == question.id
    assert attempt.submitted_answer == submitted_answer
