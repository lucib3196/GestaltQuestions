from uuid import UUID


class QuestionDBError(Exception):
    """Base exception for question persistence errors."""


class QuestionValidationError(QuestionDBError):
    """Raised when question input data is invalid."""


class QuestionNotFoundError(QuestionDBError):
    """Raised when a question cannot be found."""

    def __init__(self, question_id: str | UUID | None = None) -> None:
        message = ""
        if question_id:
            message += f"Question {question_id!s} not found. May not exist"
        super().__init__(message)


class QuestionStorageTypeError(QuestionDBError):
    """Raised when an invalid storage type is provided."""


class QuestionCreateError(QuestionDBError):
    """Raised when a question cannot be created."""


class QuestionReadError(QuestionDBError):
    """Raised when question data cannot be retrieved."""


class QuestionUpdateError(QuestionDBError):
    """Raised when a question cannot be updated."""


class QuestionDeleteError(QuestionDBError):
    """Raised when a question cannot be deleted."""


class QuestionPathError(QuestionDBError):
    """Raised when a question path cannot be read or updated."""
