from src.core import logger
from app_test.shared.mock_data import QUESTIONS_FULL
from src.model.question import Question
import pytest


@pytest.mark.parametrize("payload", QUESTIONS_FULL)
def test_make_question_with_files(make_question_with_files, payload):
    response = make_question_with_files(overrides=payload)
    assert response.status_code == 200
    assert Question.model_validate(response.json())


@pytest.mark.parametrize("payload", QUESTIONS_FULL)
def test_upload_files_to_question(payload, make_upload_files_to_question):
    response = make_upload_files_to_question(question_payload=payload)
    assert response.status_code == 200
