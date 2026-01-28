import pytest
from app_test.mock_data import QUESTION_FULL, QUESTIONS, ADDITIONAL_METADATA




@pytest.fixture
def combined_payload():
    return QUESTIONS
