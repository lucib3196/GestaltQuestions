import json
from pathlib import PurePosixPath
from typing import Any, NoReturn

import pytest

from app_test.factories.question_factory import MakeQuestion
from backend.question import Question
from backend.question.storage import (
    FileListError,
    FileOperationError,
    FileSaveError,
    StoragePathNotFoundError,
)
from backend.storage import FileData
from backend.question.storage.file_service import QuestionStorage

@pytest.mark.asyncio
async def test_get_storage_path_accepts_question_instance(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    assert (
        await question_file_service.get_storage_path(question_with_storage)
        == question_with_storage.storage_path
    )


@pytest.mark.asyncio
async def test_get_storage_path_accepts_question_id(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    assert question_with_storage.id is not None

    assert (
        await question_file_service.get_storage_path(question_with_storage.id)
        == question_with_storage.storage_path
    )


@pytest.mark.asyncio
async def test_get_storage_path_raises_when_question_has_no_storage_path(
    question_file_service: QuestionStorage,
    make_question: MakeQuestion,
) -> None:
    question = make_question(title="No storage path", storage_path=None)

    with pytest.raises(StoragePathNotFoundError):
        await question_file_service.get_storage_path(question)


@pytest.mark.asyncio
async def test_write_file_persists_text_content(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    saved_path = await question_file_service.write_file(
        question_with_storage,
        "notes.txt",
        "remember this",
    )

    assert PurePosixPath(saved_path).name == "notes.txt"
    assert (
        await question_file_service.read_file(question_with_storage, "notes.txt")
        == b"remember this"
    )


@pytest.mark.asyncio
async def test_write_file_persists_dict_content(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    await question_file_service.write_file(
        question_with_storage,
        "meta.json",
        {"difficulty": "hard"},
    )

    content = await question_file_service.read_file(question_with_storage, "meta.json")

    assert content is not None
    assert json.loads(content.decode()) == {"difficulty": "hard"}


@pytest.mark.asyncio
async def test_read_file_returns_none_for_missing_file(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    assert (
        await question_file_service.read_file(question_with_storage, "missing.txt")
        is None
    )


@pytest.mark.asyncio
async def test_delete_file_removes_file(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    await question_file_service.write_file(question_with_storage, "draft.txt", "draft")

    await question_file_service.delete_file(question_with_storage, "draft.txt")

    assert (
        await question_file_service.read_file(question_with_storage, "draft.txt")
        is None
    )


@pytest.mark.asyncio
async def test_list_files_returns_question_files(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    await question_file_service.write_file(question_with_storage, "a.txt", "A")
    await question_file_service.write_file(question_with_storage, "b.txt", "B")

    files = await question_file_service.list_files(question_with_storage)

    assert {PurePosixPath(path).name for path in files} == {"a.txt", "b.txt"}


@pytest.mark.asyncio
async def test_get_filedata_returns_file_metadata_and_content(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    await question_file_service.write_file(
        question_with_storage,
        "question.html",
        "<p>Q</p>",
    )

    files = await question_file_service.get_filedata(question_with_storage)

    assert len(files) == 1
    assert files[0].filename == "question.html"
    assert files[0].content == "<p>Q</p>"
    assert files[0].mime_type == "text/html"


@pytest.mark.asyncio
async def test_upload_files_saves_multiple_files(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    uploaded = [
        FileData(filename="server.js", content="console.log('ok')"),
        FileData(filename="client.js", content="console.log('client')"),
    ]

    saved_paths = await question_file_service.upload_files(
        question_with_storage,
        uploaded,
    )
    listed_paths = await question_file_service.list_files(question_with_storage)

    assert {PurePosixPath(path).name for path in saved_paths} == {
        file.filename for file in uploaded
    }
    assert {PurePosixPath(path).name for path in listed_paths} == {
        file.filename for file in uploaded
    }


@pytest.mark.asyncio
async def test_rename_file_moves_content_to_new_filename(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
) -> None:
    await question_file_service.write_file(
        question_with_storage,
        "draft.txt",
        "final content",
    )

    renamed_path = await question_file_service.rename_file(
        question_with_storage,
        "draft.txt",
        "final.txt",
    )

    assert PurePosixPath(renamed_path).name == "final.txt"
    assert (
        await question_file_service.read_file(question_with_storage, "draft.txt")
        is None
    )
    assert (
        await question_file_service.read_file(question_with_storage, "final.txt")
        == b"final content"
    )


@pytest.mark.asyncio
async def test_read_file_wraps_unexpected_errors(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_read_file(dir_path: str, *, filename: str | None = None) -> bytes | None:
        raise RuntimeError(f"cannot read {filename} from {dir_path}")

    monkeypatch.setattr(
        question_file_service,
        "read_storage_file",
        fail_read_file,
    )

    with pytest.raises(FileOperationError, match="read"):
        await question_file_service.read_file(question_with_storage, "broken.txt")


@pytest.mark.asyncio
async def test_list_files_wraps_unexpected_errors(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_list_files(dir_path: str, *, recursive: bool = False) -> NoReturn:
        _ = recursive
        raise RuntimeError(f"cannot list {dir_path}")

    monkeypatch.setattr(
        question_file_service,
        "list_storage_files",
        fail_list_files,
    )

    with pytest.raises(FileListError, match="list"):
        await question_file_service.list_files(question_with_storage)


@pytest.mark.asyncio
async def test_upload_files_rolls_back_saved_files_when_later_save_fails(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    original_write = question_file_service.write_storage_file
    original_delete = question_file_service.delete_storage_file
    deleted: list[str] = []
    calls = 0

    def fail_second_write(
        dir_path: str,
        data: Any,
        *,
        filename: str | None = None,
    ) -> str:
        nonlocal calls
        calls += 1
        if calls == 2:
            raise RuntimeError("second write failed")
        return original_write(dir_path, data, filename=filename)

    def record_delete(dir_path: str, *, filename: str | None = None) -> None:
        deleted.append(dir_path)
        original_delete(dir_path, filename=filename)

    monkeypatch.setattr(
        question_file_service,
        "write_storage_file",
        fail_second_write,
    )
    monkeypatch.setattr(
        question_file_service,
        "delete_storage_file",
        record_delete,
    )

    with pytest.raises(FileSaveError, match="second write failed"):
        await question_file_service.upload_files(
            question_with_storage,
            [
                FileData(filename="saved.txt", content="saved"),
                FileData(filename="failed.txt", content="failed"),
            ],
        )

    assert [PurePosixPath(path).name for path in deleted] == ["saved.txt"]
    assert (
        await question_file_service.read_file(question_with_storage, "saved.txt")
        is None
    )


@pytest.mark.asyncio
async def test_upload_files_reports_rollback_failure(
    question_file_service: QuestionStorage,
    question_with_storage: Question,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    original_write = question_file_service.write_storage_file
    calls = 0

    def fail_second_write(
        dir_path: str,
        data: Any,
        *,
        filename: str | None = None,
    ) -> str:
        nonlocal calls
        calls += 1
        if calls == 2:
            raise RuntimeError("second write failed")
        return original_write(dir_path, data, filename=filename)

    def fail_delete(dir_path: str, *, filename: str | None = None) -> None:
        raise RuntimeError(f"cannot delete {dir_path}/{filename or ''}")

    monkeypatch.setattr(
        question_file_service,
        "write_storage_file",
        fail_second_write,
    )
    monkeypatch.setattr(question_file_service, "delete_storage_file", fail_delete)

    with pytest.raises(FileSaveError, match="rollback failed"):
        await question_file_service.upload_files(
            question_with_storage,
            [
                FileData(filename="saved.txt", content="saved"),
                FileData(filename="failed.txt", content="failed"),
            ],
        )
