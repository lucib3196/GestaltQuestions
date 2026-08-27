from pathlib import Path, PurePosixPath
from typing import Any, Self

from google.cloud.storage.blob import Blob
from sqlmodel import Session

from backend.core import logger
from backend.question.exceptions import QuestionDBError
from backend.question.models import Question
from backend.question.reader import QuestionReader
from backend.shared import ID
from backend.storage import FileData, Storage
from backend.storage.filedata import guess_mime_type, normalize_filedata

from .exceptions import (
    FileListError,
    FileOperationError,
    FileRollbackError,
    FileSaveError,
    InvalidPathError,
    QuestionStorageException,
    StorageDirectoryNotFoundError,
    StorageOperationError,
    StoragePathNotFoundError,
)


class QuestionStorage:
    def __init__(self, storage: Storage, reader: QuestionReader) -> None:
        self.storage = storage
        self._reader = reader

    @classmethod
    def from_session(cls, storage: Storage, session: Session) -> Self:
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
            return self.list_storage_files(storage_path)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileListError(str(question), str(e)) from e

    async def read_file(self, question: Question | ID, filename: str) -> bytes | None:
        try:
            storage_path = await self.get_storage_path(question)
            return self.read_storage_file(storage_path, filename=filename)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("read", filename, str(e)) from e

    async def write_file(
        self,
        question: Question | ID,
        filename: str,
        data: Any,
    ) -> str:
        try:
            storage_path = await self.get_storage_path(question)
            return self.write_storage_file(storage_path, data, filename=filename)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("write", filename, str(e)) from e

    async def delete_file(self, question: Question | ID, filename: str) -> None:
        try:
            storage_path = await self.get_storage_path(question)
            self.delete_storage_file(storage_path, filename=filename)
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
            return self.rename_storage_file(
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
            return self.get_all_storage_filedata(storage_path)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("read", str(question), str(e)) from e

    async def upload_files(
        self,
        question: Question | ID,
        files: list[FileData],
    ) -> list[str]:
        try:
            storage_path = await self.get_storage_path(question)
            return self._save_files(storage_path, files, question)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise FileOperationError("upload", str(question), str(e)) from e

    def create_dir(self, dir_path: str) -> str:
        try:
            return self.storage.create_dir(self._norm_path(dir_path))
        except QuestionStorageException:
            raise
        except Exception as e:
            raise StorageOperationError("create_dir", dir_path, str(e)) from e

    def read_storage_file(
        self,
        dir_path: str,
        *,
        filename: str | None = None,
    ) -> bytes | None:
        if filename:
            dir_path = self._require_existing_dir(dir_path)
        file_path = self._construct_file_path(dir_path, filename=filename)
        return self.storage.read(file_path)

    def write_storage_file(
        self,
        dir_path: str,
        data: Any,
        *,
        filename: str | None = None,
    ) -> str:
        file_path = self._construct_file_path(dir_path, filename=filename)
        return self.storage.write(file_path, data)

    def delete_storage_file(
        self,
        dir_path: str,
        *,
        filename: str | None = None,
    ) -> None:
        if filename:
            dir_path = self._require_existing_dir(dir_path)
        file_path = self._construct_file_path(dir_path, filename=filename)
        self.storage.delete(file_path)

    def rename_storage_file(
        self,
        dir_path: str,
        old_filename: str,
        new_filename: str,
    ) -> str:
        dir_path = self._require_existing_dir(dir_path)
        old_path = self._construct_file_path(dir_path, filename=old_filename)
        new_path = self._construct_file_path(dir_path, filename=new_filename)

        written_path = self.storage.copy(old_path, new_path)
        try:
            self.storage.delete(old_path)
        except Exception as e:
            try:
                self.storage.delete(new_path)
            except Exception as cleanup_error:
                raise StorageOperationError(
                    "rename_file",
                    new_path,
                    (
                        "copied destination but failed to delete original "
                        f"({e}) and cleanup destination ({cleanup_error})"
                    ),
                ) from e
            raise

        return written_path

    def delete_dir(self, storage_path: str) -> None:
        try:
            normalized_path = self._require_existing_dir(storage_path)
            self.storage.delete(normalized_path)
        except QuestionStorageException:
            raise
        except Exception as e:
            raise StorageOperationError("delete_dir", storage_path, str(e)) from e

    def list_storage_files(
        self, dir_path: str, *, recursive: bool = False
    ) -> list[str]:
        normalized_path = self._require_existing_dir(dir_path)
        files = [
            str(path)
            for path in self.storage.list(normalized_path, recursive=recursive)
        ]
        logger.debug("Listed %s question files under %s", len(files), normalized_path)
        return files

    def batch_save_files(self, dir_path: str, files: list[FileData]) -> list[str]:
        dir_path = self._require_existing_dir(dir_path)
        return [
            self.write_storage_file(dir_path, file.content, filename=file.filename)
            for file in files
        ]

    def move(self, target: str, old: str) -> str:
        new = self.storage.create_dir(self._norm_path(target))
        return self.storage.move(old, new)

    def get_storage_filedata(
        self,
        target: str,
        *,
        filename: str | None = None,
    ) -> FileData:
        fpath = self._construct_file_path(target, filename=filename)
        content = self.read_storage_file(fpath)
        return normalize_filedata(
            PurePosixPath(fpath).name,
            content,
            mime_type=guess_mime_type(fpath),
            text_errors="replace",
        )

    def get_all_storage_filedata(self, dir_path: str) -> list[FileData]:
        return [
            self.get_storage_filedata(file_path)
            for file_path in self.list_storage_files(dir_path)
        ]

    def snapshot_dir(self, storage_path: str) -> list[FileData]:
        try:
            normalized_path = storage_path.rstrip("/") + "/"
            snapshot: list[FileData] = []

            for file_path in self.list_storage_files(normalized_path, recursive=True):
                content = self.read_storage_file(file_path)
                if content is None:
                    continue
                snapshot.append(
                    FileData(
                        filename=self._relative_filename(normalized_path, file_path),
                        content=content,
                    )
                )

            return snapshot
        except QuestionStorageException:
            raise
        except Exception as e:
            raise StorageOperationError("snapshot_dir", storage_path, str(e)) from e

    def restore_files(self, storage_path: str, snapshot: list[FileData]) -> list[str]:
        restored_files: list[str] = []
        failures: list[str] = []

        try:
            self.create_dir(storage_path)
        except QuestionStorageException as e:
            raise StorageOperationError("restore_files", storage_path, str(e)) from e

        for file in snapshot:
            try:
                restored_files.append(
                    self.write_storage_file(
                        storage_path,
                        file.content,
                        filename=file.filename,
                    )
                )
            except Exception as e:
                failures.append(f"{file.filename}: {e}")

        if failures:
            raise StorageOperationError(
                "restore_files",
                storage_path,
                "; ".join(failures),
            )

        return restored_files

    def rollback_saved_files(self, saved_files: list[str]) -> FileRollbackError | None:
        rollback_failures: list[str] = []

        for saved_file in reversed(saved_files):
            try:
                self.delete_storage_file(saved_file)
            except Exception as e:
                rollback_failures.append(f"{saved_file}: {e}")

        if rollback_failures:
            return FileRollbackError(saved_files, rollback_failures)

        return None

    def _save_files(
        self,
        storage_path: str,
        files: list[FileData],
        question: Question | ID,
    ) -> list[str]:
        saved_files: list[str] = []

        for file in files:
            try:
                saved_path = self.write_storage_file(
                    storage_path,
                    data=file.content,
                    filename=file.filename,
                )
                saved_files.append(saved_path)
            except Exception as e:
                rollback_error = self.rollback_saved_files(saved_files)
                reason = str(e)
                if rollback_error is not None:
                    reason = f"{reason}; rollback failed: {rollback_error}"
                raise FileSaveError(file.filename, str(question), reason) from e

        return saved_files

    def _construct_file_path(
        self,
        dir_path: str,
        *,
        filename: str | None = None,
    ) -> str:
        if not filename:
            return dir_path.rstrip("/")
        return f"{dir_path.rstrip('/')}/{filename}"

    def _require_existing_dir(self, dir_path: str) -> str:
        normalized_path = self._norm_path(dir_path)
        if not self.storage.exists(normalized_path):
            raise StorageDirectoryNotFoundError(
                question_id="unknown",
                path=normalized_path,
            )
        return normalized_path

    def _norm_path(self, val: str | Path | Blob) -> str:
        if isinstance(val, str):
            return val.rstrip("/") + "/"
        if isinstance(val, Path):
            return val.as_posix().rstrip("/") + "/"
        if isinstance(val, Blob):
            if not val.name:
                raise ValueError(f"Cannot determine blob: {val}")
            return val.name.rstrip("/") + "/"
        logger.warning(
            "Cannot normalize unsupported question file path type %s",
            type(val),
        )
        raise InvalidPathError(f"Cannot normalize path: unsupported type {type(val)}")

    @staticmethod
    def _relative_filename(storage_path: str, file_path: str) -> str:
        normalized_path = storage_path.rstrip("/") + "/"
        normalized_file = file_path.replace("\\", "/")

        if normalized_file.startswith(normalized_path):
            return normalized_file.removeprefix(normalized_path)

        return normalized_file.rsplit("/", maxsplit=1)[-1]
