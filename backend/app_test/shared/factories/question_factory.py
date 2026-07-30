from backend.question import Question
from backend.developer import DeveloperProfile
import pytest


@pytest.fixture
def make_question(db_session):
    def make(owner: DeveloperProfile | None = None, **overrides):
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
