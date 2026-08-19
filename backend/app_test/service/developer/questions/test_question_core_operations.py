import json
from pathlib import PurePosixPath

import pytest

from backend.authorization.profiles import ProfileAccessDenied
from backend.question import Question, QuestionFilter, QuestionUpdate
from backend.storage import FileData


@pytest.mark.asyncio
async def test_create_question_with_files(
    developer_question_service,
    dev_owner,
    make_question_payload,
) -> None:
    payload = make_question_payload(
        title="Question with files",
        topics=["math", "algebra"],
        files=[
            FileData(filename="question.html", content="<p>Question</p>"),
            FileData(filename="solution.html", content="<p>Solution</p>"),
        ],
    )

    question = await developer_question_service.create_question(
        dev_owner.user.id,
        payload=payload.question,
        files=payload.files,
    )

    assert isinstance(question, Question)
    assert question.title == payload.question.title
    assert question.created_by_id == dev_owner.profile.id
    assert question.storage_path
    assert question.storage_path.startswith(dev_owner.profile.storage_path.rstrip("/"))

    stored_files = await developer_question_service.get_question_files(
        dev_owner.user.id,
        question.id,
    )
    assert {PurePosixPath(path).name for path in stored_files} == {
        file.filename for file in payload.files or []
    }


@pytest.mark.asyncio
async def test_create_question_without_files(
    developer_question_service,
    dev_owner,
    make_question_payload,
) -> None:
    payload = make_question_payload(
        question={
            "title": "Question without files",
            "topics": ["logic"],
            "ai_generated": True,
        },
        files=None,
    )

    question = await developer_question_service.create_question(
        dev_owner.user.id,
        payload=payload.question,
        files=payload.files,
    )

    assert isinstance(question, Question)
    assert question.title == payload.question.title
    assert question.ai_generated is True
    assert question.created_by_id == dev_owner.profile.id
    assert question.storage_path
    assert question.storage_path.startswith(dev_owner.profile.storage_path.rstrip("/"))


@pytest.mark.asyncio
async def test_create_question_non_developer_cannot(
    developer_question_service,
    student_user,
    make_question_payload,
) -> None:
    payload = make_question_payload()
    with pytest.raises(ProfileAccessDenied):
        await developer_question_service.create_question(
            student_user.id, payload=payload.question, files=payload.files
        )


@pytest.fixture
def make_owned_question(developer_question_service, dev_owner, make_question_payload):
    async def make(**overrides):
        payload = make_question_payload(
            title=overrides.pop("title", "Core operations question"),
            topics=overrides.pop("topics", ["calculus"]),
            **overrides,
        )
        question = await developer_question_service.create_question(
            dev_owner.user.id,
            payload=payload.question,
            files=payload.files,
        )
        return question, payload

    return make


@pytest.mark.asyncio
async def test_get_question_simple(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    result = await developer_question_service.get_question(
        dev_owner.user.id,
        question.id,
    )

    assert result.id == question.id
    assert result.title == question.title


@pytest.mark.asyncio
async def test_get_question_full(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    result = await developer_question_service.get_question(
        dev_owner.user.id,
        question.id,
        method="full",
    )

    assert result.id == question.id
    assert result.title == question.title
    assert result.topics == ["calculus"]


@pytest.mark.asyncio
async def test_update_question(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    updated = await developer_question_service.update_question(
        dev_owner.user.id,
        question.id,
        QuestionUpdate(title="Updated core question", topics=["analysis"]),
    )

    assert updated.title == "Updated core question"
    assert updated.topics == ["analysis"]


@pytest.mark.asyncio
async def test_filter_questions_limits_to_developer_questions(
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
) -> None:
    owner_payload = make_question_payload(title="Shared filter title")
    owner_question = await developer_question_service.create_question(
        dev_owner.user.id,
        payload=owner_payload.question,
        files=None,
    )
    other_payload = make_question_payload(title="Shared filter title")
    await developer_question_service.create_question(
        dev_other.user.id,
        payload=other_payload.question,
        files=None,
    )

    results = await developer_question_service.filter_questions(
        dev_owner.user.id,
        QuestionFilter(title="Shared filter"),
    )

    assert {question.id for question in results} == {owner_question.id}


@pytest.mark.asyncio
async def test_get_question_files(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, payload = await make_owned_question()

    files = await developer_question_service.get_question_files(
        dev_owner.user.id,
        question.id,
    )

    assert {PurePosixPath(path).name for path in files} == {
        file.filename for file in payload.files or []
    }


@pytest.mark.asyncio
async def test_get_question_filedata(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, payload = await make_owned_question()

    files = await developer_question_service.get_question_filedata(
        dev_owner.user.id,
        question.id,
    )

    assert {file.filename for file in files} == {
        file.filename for file in payload.files or []
    }


@pytest.mark.asyncio
async def test_read_file(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    content = await developer_question_service.read_file(
        dev_owner.user.id,
        question.id,
        "question.html",
    )

    assert content == b"<p>Question</p>"


@pytest.mark.asyncio
async def test_write_file(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    await developer_question_service.write_file(
        dev_owner.user.id,
        question.id,
        "meta.json",
        {"difficulty": "hard"},
    )
    content = await developer_question_service.read_file(
        dev_owner.user.id,
        question.id,
        "meta.json",
    )

    assert content is not None
    assert json.loads(content.decode()) == {"difficulty": "hard"}


@pytest.mark.asyncio
async def test_delete_file(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    await developer_question_service.delete_file(
        dev_owner.user.id,
        question.id,
        "solution.html",
    )

    assert (
        await developer_question_service.read_file(
            dev_owner.user.id,
            question.id,
            "solution.html",
        )
        is None
    )


@pytest.mark.asyncio
async def test_upload_files(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    await developer_question_service.upload_files(
        dev_owner.user.id,
        question.id,
        [FileData(filename="notes.txt", content="remember this")],
    )

    content = await developer_question_service.read_file(
        dev_owner.user.id,
        question.id,
        "notes.txt",
    )
    assert content == b"remember this"


@pytest.mark.asyncio
async def test_prepare_question_download(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    download = await developer_question_service.prepare_question_download(
        dev_owner.user.id,
        question.id,
    )

    assert download["question.html"] == b"<p>Question</p>"
    assert download["solution.html"] == b"<p>Solution</p>"
    assert json.loads(download["meta.json"].decode()) == {"difficulty": "easy"}


@pytest.mark.asyncio
async def test_copy_question(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    copied = await developer_question_service.copy_question(
        question.id,
        dev_owner.user.id,
    )

    assert copied.id != question.id
    assert copied.title == f"{question.title}_copy"
    assert copied.created_by_id == dev_owner.profile.id


@pytest.mark.asyncio
async def test_delete_question(
    developer_question_service,
    dev_owner,
    make_owned_question,
) -> None:
    question, _ = await make_owned_question()

    result = await developer_question_service.delete_question(
        dev_owner.user.id,
        question.id,
    )

    assert result is True
