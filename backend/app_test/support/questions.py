from pathlib import Path

import pytest

from backend.question import QuestionDB
from backend.question.manager.services.manager import QuestionManager
from backend.storage import Storage


@pytest.fixture
def question_db(db_session, seed_qtypes) -> QuestionDB:
    return QuestionDB(db_session)


@pytest.fixture
def question_manager(raw_storage, question_db) -> QuestionManager:
    return QuestionManager(storage=raw_storage, qdb=question_db)


@pytest.fixture
def storage_base_path(raw_storage: Storage, tmp_path: Path) -> str:
    if raw_storage.get_storage_type() == "local":
        return (tmp_path / "developers" / "user-1").as_posix()
    return "developers/user-1"


# @pytest.fixture
# def question_payload() -> QuestionCreate:
#     return QuestionCreate(
#         title="Bernoulli Equation",
#         topics=["fluid-dynamics"],
#         qType=[QType.MC],
#         ai_generated=False,
#         isAdaptive=False,
#     )


# @pytest.fixture
# def question_files() -> list[FileData]:
#     return [
#         FileData(filename="question.html", content="<p>Question</p>"),
#         FileData(filename="solution.html", content="<p>Solution</p>"),
#         FileData(filename="meta.json", content={"difficulty": "easy"}),
#     ]
