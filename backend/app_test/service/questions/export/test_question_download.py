import json

import pytest

from app_test.factories.question_factory import MakeQuestionPayload
from backend.question.export.service import QuestionDownload
from backend.question.manager import QuestionManager
from backend.question.reader.question_reader import QuestionReader


@pytest.fixture
def reader(db_session) -> QuestionReader:
    return QuestionReader(db_session)


@pytest.fixture
def downloader(question_manager, reader: QuestionReader) -> QuestionDownload:
    return QuestionDownload(question_manager, reader)


@pytest.mark.asyncio
async def test_download_prepares_zip_payload(
    question_manager: QuestionManager,
    make_question_payload: MakeQuestionPayload,
    downloader: QuestionDownload,
    storage_base_path: str,
) -> None:
    payload = make_question_payload()
    question = await question_manager.create_question(
        payload.question,
        storage_base_path,
        payload.files,
    )

    download = await downloader.download(question)

    assert download.question_id == question.id
    assert download.folder_name == question.title
    assert download.files["question.html"] == b"<p>Question</p>"
    assert download.files["solution.html"] == b"<p>Solution</p>"
    assert json.loads(download.files["meta.json"].decode("utf-8")) == {
        "difficulty": "easy"
    }
    assert "image.png" in download.files

    info = json.loads(download.files["info2.json"].decode("utf-8"))
    assert info["id"] == str(question.id)
    assert info["title"] == question.title


@pytest.mark.asyncio
async def test_download_file_returns_single_file_content(
    question_manager: QuestionManager,
    make_question_payload: MakeQuestionPayload,
    downloader: QuestionDownload,
    storage_base_path: str,
) -> None:
    payload = make_question_payload()
    question = await question_manager.create_question(
        payload.question,
        storage_base_path,
        payload.files,
    )

    content = await downloader.download_file(question, "solution.html")

    assert content == b"<p>Solution</p>"


@pytest.mark.asyncio
async def test_download_file_returns_empty_bytes_when_file_is_missing(
    question_manager: QuestionManager,
    make_question_payload: MakeQuestionPayload,
    downloader: QuestionDownload,
    storage_base_path: str,
) -> None:
    payload = make_question_payload()
    question = await question_manager.create_question(
        payload.question,
        storage_base_path,
        payload.files,
    )

    content = await downloader.download_file(question, "missing.html")

    assert content == b""
