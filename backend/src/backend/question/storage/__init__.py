from .exceptions import (
    FileListError,
    FileOperationError,
    FileRollbackError,
    FileSaveError,
    InvalidFileError,
    InvalidPathError,
    PathNormalizationError,
    QuestionStorageException,
    StorageDirectoryNotFoundError,
    StorageOperationError,
    StoragePathNotFoundError,
)
from .storage import QuestionStorage

__all__ = [
    "FileListError",
    "FileOperationError",
    "FileRollbackError",
    "FileSaveError",
    "InvalidFileError",
    "InvalidPathError",
    "PathNormalizationError",
    "QuestionFileService",
    "QuestionStorage",
    "QuestionStorageException",
    "StorageDirectoryNotFoundError",
    "StorageOperationError",
    "StoragePathNotFoundError",
]


def __getattr__(name: str):
    if name == "QuestionFileService":
        from .file_service import QuestionFileService

        return QuestionFileService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
