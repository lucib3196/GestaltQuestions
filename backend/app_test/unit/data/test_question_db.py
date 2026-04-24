import pytest
from typing import Any, Literal
from src.data.question_exceptions import QuestionValidationError
from src.model.question import Question, QuestionData
from src.data.question import QuestionDB
from uuid import uuid4

PayloadMap = dict[str, dict[str, Any]]
StorageType = Literal["local", "cloud"]


@pytest.fixture
def question_payloads() -> PayloadMap:
    return {
        "basic": {
            "title": "Addition",
            "ai_generated": True,
            "isAdaptive": False,
            "base_path": "questions/",
        },
        "nested": {
            "title": "Multiplication",
            "ai_generated": True,
            "isAdaptive": False,
            "base_path": "questions/math/",
        },
        "scoped": {
            "title": "Division",
            "ai_generated": False,
            "isAdaptive": False,
            "base_path": "user123/questions/",
        },
        "with_relationships": {
            "title": "Bernoulli Equation",
            "ai_generated": True,
            "isAdaptive": True,
            "topics": ["fluid-dynamics", "flow-analysis"],
            "languages": ["javascript"],
            "qTypes": ["multiple-choice"],
        },
        "filter_seed": {
            "title": "Addition",
            "ai_generated": True,
            "isAdaptive": False,
            "topics": ["math"],
            "languages": ["python"],
            "qTypes": ["multiple-choice"],
        },
        "creator_owned": {
            "title": "Creator Owned",
            "ai_generated": False,
            "isAdaptive": False,
            "base_path": "developers/user123/",
            "question_path": "developers/user123/creator-owned",
        },
    }


@pytest.fixture
def bad_question_payloads() -> dict[str, dict[str, Any]]:
    return {
        "invalid_title_type": {
            "title": {"bad": "value"},
            "ai_generated": True,
            "isAdaptive": False,
            "base_path": "questions/",
        },
        "invalid_topic_shape": {
            "title": "Bad Topics",
            "ai_generated": True,
            "isAdaptive": False,
            "topics": [{"name": "math"}],
        },
        "invalid_uuid": {
            "id": "not-a-real-uuid",
            "title": "Bad UUID",
            "ai_generated": False,
            "isAdaptive": False,
            "base_path": "questions/",
        },
    }


@pytest.fixture
def combined_payload(question_payloads: PayloadMap) -> list[QuestionData]:
    return [
        QuestionData(**question_payloads["basic"]),
        QuestionData(**question_payloads["nested"]),
        QuestionData(**question_payloads["scoped"]),
    ]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload_key",
    ["basic", "nested", "scoped"],
)
async def test_create_question(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
    payload_key: str,
) -> None:
    payload = question_payloads[payload_key]

    created = await question_db.create_question(payload)

    assert created is not None
    assert isinstance(created, Question)
    assert created.title == payload["title"]
    assert created.ai_generated == payload["ai_generated"]
    assert created.isAdaptive == payload["isAdaptive"]


@pytest.mark.asyncio
async def test_create_question_with_relationships(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
) -> None:
    payload = question_payloads["with_relationships"]

    created = await question_db.create_question(payload)

    assert created is not None
    assert created.title == payload["title"]
    assert len(created.topics) == 2
    assert len(created.languages) == 1
    assert len(created.qTypes) == 1


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload_key",
    ["basic", "with_relationships"],
)
async def test_get_question(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
    payload_key: str,
) -> None:
    payload = question_payloads[payload_key]

    created = await question_db.create_question(payload)
    found = await question_db.get_question(created.id)

    assert found == created


@pytest.mark.asyncio
async def test_get_all_questions(
    question_db: QuestionDB,
    combined_payload: list[QuestionData],
) -> None:
    for payload in combined_payload:
        created = await question_db.create_question(payload)
        assert created is not None

    questions = await question_db.get_all_questions()

    assert isinstance(questions, list)
    assert all(isinstance(question, Question) for question in questions)
    assert len(questions) == len(combined_payload)


@pytest.mark.asyncio
async def test_delete_all_questions(
    question_db: QuestionDB,
    combined_payload: list[QuestionData],
) -> None:
    for payload in combined_payload:
        created = await question_db.create_question(payload)
        assert created is not None

    deleted = await question_db.delete_all_questions()
    questions = await question_db.get_all_questions()

    assert deleted is True
    assert questions == []


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload_key",
    ["basic", "with_relationships"],
)
async def test_delete_question(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
    payload_key: str,
) -> None:
    payload = question_payloads[payload_key]

    created = await question_db.create_question(payload)
    deleted = await question_db.delete_question(created.id)

    assert deleted is True
    assert await question_db.get_question(created.id) is None


@pytest.mark.asyncio
async def test_update_question_updates_scalar_and_relationship_fields(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
) -> None:
    created = await question_db.create_question(question_payloads["basic"])

    update_data = QuestionData(
        title="new title",
        topics=["history", "math", "science"],
    )

    updated = await question_db.update_question(created.id, update_data)

    assert updated is not None
    assert isinstance(updated, QuestionData)
    assert updated.title == "new title"
    assert set(updated.topics) == set(["history", "math", "science"])


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "storage_type, expected_attr",
    [
        ("cloud", "blob_path"),
        ("local", "local_path"),
    ],
)
@pytest.mark.parametrize(
    "payload_key",
    ["basic", "with_relationships"],
)
async def test_set_question_path(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
    storage_type: StorageType,
    expected_attr: str,
    payload_key: str,
) -> None:
    payload = question_payloads[payload_key]

    created = await question_db.create_question(payload)
    updated = await question_db.set_question_path(
        created.id,
        path="/test",
        storage_type=storage_type,
    )

    assert getattr(updated, expected_attr) == "/test/"

@pytest.mark.asyncio
@pytest.mark.parametrize(
    "storage_type, expected_attr, unexpected_attr",
    [
        ("local", "local_path", "blob_path"),
        ("cloud", "blob_path", "local_path"),
    ],
)
async def test_create_question_with_user_sets_question_path(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
    storage_type: StorageType,
    expected_attr: str,
    unexpected_attr: str,
) -> None:
    payload = question_payloads["creator_owned"]
    user = uuid4()

    q = await question_db.create_question(
        payload,
        created_by=user,
        storage_type=storage_type,
    )

    assert q is not None
    assert isinstance(q, Question)
    assert q.created_by_id == user
    assert q.title == payload["title"]
    assert q.ai_generated == payload["ai_generated"]
    assert q.isAdaptive == payload["isAdaptive"]
    assert getattr(q, expected_attr) == "developers/user123/creator-owned/"
    assert getattr(q, unexpected_attr) is None


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload_key",
    ["invalid_title_type", "invalid_topic_shape"],
)
async def test_create_question_with_bad_payload_raises_validation_error(
    question_db: QuestionDB,
    bad_question_payloads: PayloadMap,
    payload_key: str,
) -> None:
    payload = bad_question_payloads[payload_key]

    with pytest.raises(
        QuestionValidationError,
        match="Question payload is invalid",
    ):
        await question_db.create_question(payload)


@pytest.mark.asyncio
async def test_create_question_with_bad_uuid_raises_value_error(
    question_db: QuestionDB,
    bad_question_payloads: PayloadMap,
) -> None:
    payload = bad_question_payloads["invalid_uuid"]

    with pytest.raises(ValueError, match="Invalid UUID"):
        await question_db.create_question(payload)


@pytest.mark.asyncio
async def test_create_question_with_user_requires_question_path(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
) -> None:
    payload = dict(question_payloads["basic"])
    user = uuid4()

    with pytest.raises(
        QuestionValidationError,
        match="question_path is required when created_by is provided.",
    ):
        await question_db.create_question(
            payload,
            created_by=user,
            storage_type="local",
        )


@pytest.mark.asyncio
async def test_create_question_with_user_requires_storage_type(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
) -> None:
    payload = question_payloads["creator_owned"]
    user = uuid4()

    with pytest.raises(
        QuestionValidationError,
        match="storage_type is required when created_by is provided.",
    ):
        await question_db.create_question(payload, created_by=user)


@pytest.mark.asyncio
@pytest.mark.parametrize("storage_type", ["local", "cloud"])
async def test_get_questions_by_user_returns_all_questions_for_creator(
    question_db: QuestionDB,
    question_payloads: PayloadMap,
    storage_type: StorageType,
) -> None:
    user = uuid4()
    other_user = uuid4()

    created_for_user = [
        await question_db.create_question(
            {**question_payloads["creator_owned"], "question_path": "developers/user123/q1"},
            created_by=user,
            storage_type=storage_type,
        ),
        await question_db.create_question(
            {**question_payloads["creator_owned"], "question_path": "developers/user123/q2"},
            created_by=user,
            storage_type=storage_type,
        ),
        await question_db.create_question(
            {**question_payloads["creator_owned"], "question_path": "developers/user123/q3"},
            created_by=user,
            storage_type=storage_type,
        ),
    ]
    other_question = await question_db.create_question(
        {
            **question_payloads["creator_owned"],
            "question_path": "developers/other-user/q4",
        },
        created_by=other_user,
        storage_type=storage_type,
    )

    q_retrieved = await question_db.get_questions_by_creator(user)

    assert q_retrieved
    assert len(q_retrieved) == len(created_for_user)
    assert {q.id for q in q_retrieved} == {q.id for q in created_for_user}
    assert all(q.created_by_id == user for q in q_retrieved)
    assert other_question.id not in {q.id for q in q_retrieved}
