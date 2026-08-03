from typing import Any, Protocol

import pytest

from backend.developer import DeveloperProfile
from backend.question import Question


class MakeQuestion(Protocol):
    def __call__(
        self,
        owner: DeveloperProfile | None = None,
        **overrides: Any,
    ) -> Question: ...


@pytest.fixture
def make_question(db_session) -> MakeQuestion:
    def make(owner: DeveloperProfile | None = None, **overrides) -> Question:
        question = Question(
            title=overrides.pop("title", "Owned question"),
            created_by=owner,
            **overrides,
        )
        db_session.add(question)
        db_session.commit()
        db_session.refresh(question)
        return question

    return make
