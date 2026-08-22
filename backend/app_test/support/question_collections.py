import pytest

from backend.developer import DeveloperProfile
from backend.question.collections import (
    QuestionCollectionAdapter,
    QuestionCollectionReader,
    QuestionCollectionService,
)


@pytest.fixture
def question_collection_service(
    db_session,
) -> QuestionCollectionService[DeveloperProfile]:
    return QuestionCollectionService(session=db_session)


@pytest.fixture
def question_collection_adapter(db_session) -> QuestionCollectionAdapter:
    return QuestionCollectionAdapter(db_session)


@pytest.fixture
def question_collection_reader(db_session) -> QuestionCollectionReader:
    return QuestionCollectionReader(db_session)
