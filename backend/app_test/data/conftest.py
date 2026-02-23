import pytest
from app_test.shared.mock_data import (
    QUESTIONS,
)
from src.types import QuestionData
from src.data import (
    UserDB,
    RoleManager,
    InstitutionDB,
    QuestionAttemptDB,
)

@pytest.fixture
def combined_payload():
    return [QuestionData(**q) for q in QUESTIONS]


@pytest.fixture
def role_manager(db_session) -> RoleManager:
    return RoleManager(db_session)


@pytest.fixture
def user_db(db_session) -> UserDB:
    return UserDB(db_session)


@pytest.fixture
def institution_db(db_session) -> InstitutionDB:
    return InstitutionDB(db_session)


@pytest.fixture
def qa_attempt_db(db_session) -> QuestionAttemptDB:
    return QuestionAttemptDB(db_session)


@pytest.fixture
def question_payload():
    """Full question payload including topics, qtypes, and languages."""
    return QUESTIONS[0]
