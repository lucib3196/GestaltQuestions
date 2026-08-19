from dataclasses import dataclass
from typing import Any, Protocol

import pytest

from backend.developer import DeveloperProfile
from backend.question import Question, QuestionCreate
from backend.storage import FileData


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


@dataclass(frozen=True)
class QuestionPayload:
    question: QuestionCreate
    files: list[FileData] | None


class MakeQuestionPayload(Protocol):
    def __call__(
        self,
        **overrides: Any,
    ) -> QuestionPayload: ...


@pytest.fixture
def make_question_payload() -> MakeQuestionPayload:
    def make(**overrides) -> QuestionPayload:
        question_data = {
            "title": "Question",
            "topics": ["math"],
            **overrides.pop("question", {}),
        }
        files = overrides.pop(
            "files",
            [
                FileData(filename="question.html", content="<p>Question</p>"),
                FileData(filename="solution.html", content="<p>Solution</p>"),
                FileData(filename="meta.json", content={"difficulty": "easy"}),
            ],
        )

        return QuestionPayload(
            question=QuestionCreate(**(question_data | overrides)),
            files=files,
        )

    return make
