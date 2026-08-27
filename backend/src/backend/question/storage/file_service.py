from typing import Any

from sqlmodel import Session

from backend.question.exceptions import QuestionDBError
from backend.question.models import Question
from backend.question.reader import QuestionReader
from backend.shared import ID
from backend.storage import FileData

from .exceptions import (
    FileListError,
    FileOperationError,
    FileRollbackError,
    FileSaveError,
    QuestionStorageException,
    StorageOperationError,
    StoragePathNotFoundError,
)
from .storage import QuestionStorage


class QuestionFileService:
    def __init__(self, storage: QuestionStorage, reader: QuestionReader) -> None:
        self._storage = storage
        self._reader = reader

    @classmethod
    def from_session(cls, storage: QuestionStorage, session: Session):
        return cls(storage=storage, reader=QuestionReader(session))

    async def get_storage_path(self, question: Question | ID) -> str:
        try:
            question = self._reader.get_question(question)
            storage_path = question.storage_path
            if not storage_path:
                raise StoragePathNotFoundError(str(question.id))
            return storage_path
        except (QuestionDBError, QuestionStorageException):
            raise
        except Exception as e:
            raise StorageOperationError("resolve_path", str(question), str(e)) from e

    async def list_files(self, question: Question | ID) -> list[str]:
        try:
            storage_path = await self.get_storage_path(question)
            return list(self._storage.list_files(storage_path))
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileListError(str(question), str(e)) from e

    async def read_file(self, question: Question | ID, filename: str) -> bytes | None:
        try:
            storage_path = await self.get_storage_path(question)
            return self._storage.read_file(storage_path, filename=filename)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("read", filename, str(e)) from e

    async def write_file(self, question: Question | ID, filename: str, data: Any):
        try:
            storage_path = await self.get_storage_path(question)
            return self._storage.write_file(storage_path, data, filename=filename)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("write", filename, str(e)) from e

    async def delete_file(self, question: Question | ID, filename: str):
        try:
            storage_path = await self.get_storage_path(question)
            return self._storage.delete_file(storage_path, filename=filename)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("delete", filename, str(e)) from e

    async def rename_file(
        self,
        question: Question | ID,
        old_filename: str,
        new_filename: str,
    ) -> str:
        try:
            storage_path = await self.get_storage_path(question)
            return self._storage.rename_file(
                storage_path,
                old_filename,
                new_filename,
            )
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError(
                "rename",
                f"{old_filename} -> {new_filename}",
                str(e),
            ) from e

    async def get_filedata(self, question: Question | ID) -> list[FileData]:
        try:
            storage_path = await self.get_storage_path(question)
            return self._storage.get_all_filedata(storage_path)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("read", str(question), str(e)) from e

    async def upload_files(
        self, question: Question | ID, files: list[FileData]
    ) -> list[str]:
        try:
            storage_path = await self.get_storage_path(question)
            return self._save_files(storage_path, files, question)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("upload", str(question), str(e)) from e

    def _save_files(
        self,
        storage_path: str,
        files: list[FileData],
        question: Question | ID,
    ) -> list[str]:
        saved_files: list[str] = []

        for file in files:
            try:
                saved_path = self._storage.write_file(
                    storage_path,
                    data=file.content,
                    filename=file.filename,
                )
                saved_files.append(saved_path)
            except Exception as e:
                rollback_error = self._rollback_saved_files(saved_files)
                reason = str(e)
                if rollback_error is not None:
                    reason = f"{reason}; rollback failed: {rollback_error}"
                raise FileSaveError(file.filename, str(question), reason) from e

        return saved_files

    def _rollback_saved_files(self, saved_files: list[str]) -> FileRollbackError | None:
        rollback_failures: list[str] = []

        for saved_file in reversed(saved_files):
            try:
                self._storage.delete_file(saved_file)
            except Exception as e:
                rollback_failures.append(f"{saved_file}: {e}")

        if rollback_failures:
            return FileRollbackError(saved_files, rollback_failures)

        return None
