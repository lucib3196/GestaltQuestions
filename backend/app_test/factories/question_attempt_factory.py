from typing import Tuple

import pytest


from src.database.repo import question_attempt as qa

from src.database.models.question import Question
from src.database.models.question_attempt import QuestionAttempt
from src.database.models.users import User


@pytest.fixture
def make_submission_attempt(make_user, make_question, db_session):
    async def make(
        quiz_data, submission, user=None, question=None, session=db_session
    ) -> Tuple[QuestionAttempt, User, Question]:
        if user is None:
            user = make_user()
        if question is None:
            question = await make_question()
        return (
            qa.create_attempt(question.id, user.id, quiz_data, submission, session),
            user,
            question,
        )

    return make
