from pathlib import Path

import pytest
from sqlmodel import Session

from app_test.factories.question_factory import MakeQuestion
from backend.question import Question, QuestionDB
from backend.question.manager import QuestionManager
from backend.question.storage import QuestionStorage
from backend.storage import Storage


@pytest.fixture
def question_db(db_session: Session, seed_qtypes: None) -> QuestionDB:  # noqa: ARG001
    return QuestionDB(db_session)


@pytest.fixture
def question_file_service(
    raw_storage: Storage,
    db_session: Session,
) -> QuestionStorage:
    return QuestionStorage.from_session(raw_storage, db_session)


@pytest.fixture
def question_manager(
    question_file_service: QuestionStorage, question_db: QuestionDB
) -> QuestionManager:
    return QuestionManager(storage=question_file_service, qdb=question_db)


@pytest.fixture
def storage_base_path(raw_storage: Storage, tmp_path: Path) -> str:
    if raw_storage.get_storage_type() == "local":
        return (tmp_path / "developers" / "user-1").as_posix()
    return "developers/user-1"


@pytest.fixture
def question_with_storage(
    make_question: MakeQuestion,
    storage_base_path: str,
    raw_storage: Storage,
) -> Question:
    storage_path = f"{storage_base_path.rstrip('/')}/questions/file-service-test"
    raw_storage.create_dir(storage_path)
    return make_question(
        title="File service question",
        storage_path=storage_path,
        storage_type=raw_storage.get_storage_type(),
    )
