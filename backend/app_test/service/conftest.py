import pytest
from app_test.shared.mock_data import (
    QUESTIONS,
)
from typing import List
from src.types import FileData
# Keep these imports for the factory
from app_test.shared.factories.storage_factory import create_dir_factory
from app_test.shared.factories.question_manager_factory import make_question_qm

@pytest.fixture
def question_file_payload() -> List[FileData]:
    files_data = [
        ("question.html", "Some question text"),
        ("solution.html", "Some solution"),
        ("server.js", "some code content"),
        ("meta.json", {"content": "some content"}),
    ]
    return [FileData(filename=f[0], content=f[1]) for f in files_data]
