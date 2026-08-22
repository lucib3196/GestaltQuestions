from typing import Any, Protocol

import pytest

from backend.question.collections import QuestionCollection


class MakeCollection(Protocol):
    def __call__(self, **overrides: Any) -> QuestionCollection: ...


@pytest.fixture
def make_collection(db_session) -> MakeCollection:
    def make(**overrides: Any) -> QuestionCollection:
        collection = QuestionCollection(
            title=overrides.pop("title", "Collection"),
            **overrides,
        )
        db_session.add(collection)
        db_session.commit()
        db_session.refresh(collection)
        return collection

    return make
