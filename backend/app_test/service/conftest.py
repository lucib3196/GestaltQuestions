import pytest
from app_test.shared.mock_data import (
    QUESTION_FULL,
    QUESTIONS,
    ADDITIONAL_METADATA,
    QUESTIONS_FULL,
)


@pytest.fixture
def question_payload():
    """Full question payload including topics, qtypes, and languages."""
    return QUESTION_FULL
