class QuestionAccessError(Exception):
    """Base exception for question access failures."""


class QuestionAccessDenied(QuestionAccessError, PermissionError):
    """Raised when a user cannot perform an action on a question."""

    def __init__(
        self,
        reason: str,
        user_id: str | None = None,
        question_id: str | None = None,
    ) -> None:
        message = "Question access denied"
        if user_id:
            message += f" for user {user_id}"
        if question_id:
            message += f" on question {question_id}"
        if reason:
            message += f": {reason}"
        super().__init__(message)


class QuestionAccessControlError(QuestionAccessError):
    """Raised when question ownership or access cannot be evaluated."""

    def __init__(self, user_id: str, question_id: str, details: str = "") -> None:
        message = (
            f"Failed to evaluate question access for user {user_id} "
            f"on question {question_id}"
        )
        if details:
            message += f": {details}"
        super().__init__(message)


class QuestionAccessValidationError(QuestionAccessError, ValueError):
    """Raised when question access input or policy state is invalid."""

    def __init__(self, reason: str, details: str = "") -> None:
        message = f"Invalid question access request: {reason}"
        if details:
            message += f" - {details}"
        super().__init__(message)
