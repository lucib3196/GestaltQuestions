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

__all__ = [
    "FileListError",
    "FileOperationError",
    "FileRollbackError",
    "FileSaveError",
    "InvalidFileError",
    "InvalidPathError",
    "PathNormalizationError",
    "QuestionStorage",
    "QuestionStorageException",
    "StorageDirectoryNotFoundError",
    "StorageOperationError",
    "StoragePathNotFoundError",
]


def __getattr__(name: str) -> object:
    if name == "QuestionStorage":
        from .file_service import QuestionStorage

        return QuestionStorage
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
