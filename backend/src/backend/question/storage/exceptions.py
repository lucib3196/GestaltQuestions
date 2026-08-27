"""Question storage exceptions.

These exceptions belong to question file/path/storage behavior and do not
inherit from QuestionManagerException.
"""


class QuestionStorageException(Exception):
    """Base exception for question storage/file/path operations."""


class StoragePathNotFoundError(QuestionStorageException):
    """Raised when a question storage path is not provided or invalid."""

    def __init__(self, question_id: str | None = None) -> None:
        if question_id:
            message = f"Storage path not found for question: {question_id}"
        else:
            message = "No storage path provided for question"
        super().__init__(message)


class StorageOperationError(QuestionStorageException):
    """Raised when a storage operation fails."""

    def __init__(self, operation: str, path: str, details: str = "") -> None:
        message = f"Storage operation failed [{operation}]: {path}"
        if details:
            message += f" - {details}"
        super().__init__(message)


class StorageDirectoryNotFoundError(QuestionStorageException):
    """Raised when a question's storage directory does not exist."""

    def __init__(self, question_id: str, path: str) -> None:
        message = f"Storage directory does not exist for question {question_id}: {path}"
        super().__init__(message)


class FileOperationError(QuestionStorageException):
    """Raised when a file operation fails."""

    def __init__(self, operation: str, filename: str, reason: str = "") -> None:
        message = f"File operation failed [{operation}]: {filename}"
        if reason:
            message += f" - {reason}"
        super().__init__(message)


class InvalidFileError(FileOperationError):
    """Raised when a file is invalid or cannot be processed."""

    def __init__(self, filename: str, reason: str) -> None:
        super().__init__("validate", filename, reason)


class FileSaveError(FileOperationError):
    """Raised when saving a file to question storage fails."""

    def __init__(self, filename: str, question_id: str, reason: str = "") -> None:
        detail = f"question {question_id}"
        if reason:
            detail = f"{detail}: {reason}"
        super().__init__("save", filename, detail)


class FileRollbackError(StorageOperationError):
    """Raised when cleanup of files saved during a failed upload fails."""

    def __init__(self, saved_files: list[str], failures: list[str]) -> None:
        super().__init__(
            "rollback_saved_files",
            ", ".join(saved_files),
            "; ".join(failures),
        )


class FileListError(FileOperationError):
    """Raised when listing files in a question fails."""

    def __init__(self, question_id: str, reason: str = "") -> None:
        super().__init__("list", question_id, reason)


class PathNormalizationError(QuestionStorageException):
    """Raised when path normalization fails."""

    def __init__(self, path, reason: str = "") -> None:
        message = f"Failed to normalize path: {path}"
        if reason:
            message += f" - {reason}"
        super().__init__(message)


class InvalidPathError(PathNormalizationError):
    """Raised when a path is invalid or unsupported."""

    def __init__(self, path, path_type: str = "") -> None:
        reason = f"type: {path_type}" if path_type else ""
        super().__init__(path, reason)
