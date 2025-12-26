from .models.question_attempt import QuestionAttempt
from uuid import UUID
from typing import Dict, Any
from src.utils import convert_uuid
from src.api.core import SessionDep
from sqlmodel import select


ID = str | UUID


def create_attempt(
    question_id: ID,
    user_id: ID,
    quiz_data: Dict[str, Any],
    submitted_answer: Dict[str, Any],
    session: SessionDep,
) -> QuestionAttempt:
    attempt = QuestionAttempt(
        question_id=convert_uuid(question_id),
        user_id=convert_uuid(user_id),
        quiz_data=quiz_data,
        submitted_answer=submitted_answer,
        is_correct=False,
    )
    session.add(attempt)
    session.commit()
    session.refresh(attempt)
    return attempt


def get_attempt_by_user(user_id: ID, session: SessionDep):
    stmt = select(QuestionAttempt).where(user_id == convert_uuid(user_id))
    results = session.exec(stmt).all()
    return results


def get_attemps_by_question():
    pass


def get_latest_attemp():
    pass
