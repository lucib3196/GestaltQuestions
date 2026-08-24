import pytest
from sqlmodel import Session

from backend.developer import DeveloperProfile
from backend.question.collections import (
    QuestionCollectionAdapter,
    QuestionCollectionReader,
    QuestionCollectionService,
)


@pytest.fixture
def question_collection_service(
    db_session: Session,
) -> QuestionCollectionService[DeveloperProfile]:
    return QuestionCollectionService(session=db_session)


@pytest.fixture
def question_collection_adapter(db_session: Session) -> QuestionCollectionAdapter:
    return QuestionCollectionAdapter(db_session)


@pytest.fixture
def question_collection_reader(
    db_session: Session,
) -> QuestionCollectionReader[DeveloperProfile]:
    return QuestionCollectionReader(db_session)
