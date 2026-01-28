import pytest
from app_test.shared.mock_data import (
    QUESTION_FULL,
    QUESTIONS,
    ADDITIONAL_METADATA,
    QUESTIONS_FULL,
)
from app_test.shared.factories import make_question, make_user, make_submission_attempt
from src.types import QuestionBase,QuestionData


@pytest.fixture
def combined_payload():
    return [QuestionData(**q) for q in QUESTIONS_FULL]
