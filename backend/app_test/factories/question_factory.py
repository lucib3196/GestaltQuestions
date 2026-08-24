import base64
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

import pytest
from sqlmodel import select

from backend.developer import DeveloperProfile
from backend.question import (
    QType,
    Question,
    QuestionCreate,
    QuestionType,
    Status,
    Topic,
)
from backend.storage import FileData


class MakeQuestion(Protocol):
    def __call__(
        self,
        owner: DeveloperProfile | None = None,
        **overrides: Any,
    ) -> Question: ...


@pytest.fixture
def make_question(db_session) -> MakeQuestion:
    def get_or_create_topic(name: str) -> Topic:
        topic = db_session.exec(select(Topic).where(Topic.name == name)).first()
        if topic is not None:
            return topic

        topic = Topic(name=name)
        db_session.add(topic)
        db_session.flush()
        return topic

    def get_or_create_qtype(name: QType | str) -> QuestionType:
        qtype_name = name if isinstance(name, QType) else QType(name.lower())
        qtype = db_session.exec(
            select(QuestionType).where(QuestionType.name == qtype_name)
        ).first()
        if qtype is not None:
            return qtype

        qtype = QuestionType(
            name=qtype_name,
            display_name=qtype_name.display_name,
        )
        db_session.add(qtype)
        db_session.flush()
        return qtype

    def make(owner: DeveloperProfile | None = None, **overrides: Any) -> Question:
        topic_names = overrides.pop("topics", ["math"])
        qtype_names = overrides.pop("qType", [QType.MC])

        question_attrs = {
            "title": "Owned question",
            "isAdaptive": False,
            "ai_generated": False,
            "status": Status.DRAFT,
            "storage_type": "cloud",
            "storage_path": None,
            "created_by": owner,
            **overrides,
        }

        question = Question(**question_attrs)
        db_session.add(question)
        question.topics = [
            topic if isinstance(topic, Topic) else get_or_create_topic(topic)
            for topic in topic_names
        ]
        question.qType = [
            qtype if isinstance(qtype, QuestionType) else get_or_create_qtype(qtype)
            for qtype in qtype_names
        ]

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
        path = Path("app_test/assets/image.jpg").resolve()
        with open(path, "rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode("utf-8")
        files = overrides.pop(
            "files",
            [
                FileData(filename="question.html", content="<p>Question</p>"),
                FileData(filename="solution.html", content="<p>Solution</p>"),
                FileData(filename="meta.json", content={"difficulty": "easy"}),
                FileData(filename="image.png", content=encoded),
            ],
        )

        return QuestionPayload(
            question=QuestionCreate(**(question_data | overrides)),
            files=files,
        )

    return make
