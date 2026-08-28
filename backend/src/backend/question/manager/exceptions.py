"""Custom exceptions for QuestionManager service."""


class QuestionManagerException(Exception):
    """Base exception for all QuestionManager errors."""

    pass


# ============================================================
# Developer Question Service Exceptions
# ============================================================


class DeveloperQuestionServiceError(QuestionManagerException):
    """Base exception for developer question service errors."""


class DeveloperQuestionControlError(DeveloperQuestionServiceError):
    """Raised when developer question ownership/control cannot be evaluated."""

    def __init__(self, user_id: str, question_id: str, details: str = "") -> None:
        message = (
            f"Failed to evaluate question control for user {user_id} "
            f"on question {question_id}"
        )
        if details:
            message += f": {details}"
        super().__init__(message)


# ============================================================
# Question Lifecycle Exceptions
# ============================================================


class QuestionNotFound(QuestionManagerException):
    """Raised when a question cannot be retrieved from the database."""

    def __init__(self, question_id: str) -> None:
        message = f"Question not found: {question_id}"
        super().__init__(message)


class QuestionCreationError(QuestionManagerException):
    """Raised when question creation fails."""

    def __init__(self, reason: str, details: str = "") -> None:
        message = f"Failed to create question: {reason}"
        if details:
            message += f" - {details}"
        super().__init__(message)


class QuestionUpdateError(QuestionManagerException):
    """Raised when question update fails."""

    def __init__(self, question_id: str, reason: str, details: str = "") -> None:
        message = f"Failed to update question {question_id}: {reason}"
        if details:
            message += f" - {details}"
        super().__init__(message)


class QuestionCopyFailure(QuestionManagerException):
    def __init__(self, reason: str, details: str = "") -> None:
        message = f"Failed to update question : {reason}"
        if details:
            message += f" - {details}"
        super().__init__(message)


class QuestionDeletionError(QuestionManagerException):
    """Raised when question deletion fails."""

    def __init__(self, question_id: str, reason: str = "", details: str = "") -> None:
        message = f"Failed to delete question {question_id}"
        if reason:
            message += f": {reason}"
        if details:
            message += f" - {details}"
        super().__init__(message)


# ============================================================
# Data Validation Exceptions
# ============================================================


class InvalidQuestionDataError(QuestionManagerException):
    """Raised when question data is invalid."""

    def __init__(self, field: str, reason: str) -> None:
        message = f"Invalid question data field '{field}': {reason}"
        super().__init__(message)


class MissingQuestionDataError(QuestionManagerException):
    """Raised when required question data is missing."""

    def __init__(self, field: str) -> None:
        message = f"Missing required question field: {field}"
        super().__init__(message)
