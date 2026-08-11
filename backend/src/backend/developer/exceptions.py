from backend.auth.exceptions import AuthError


class DeveloperAccessDenied(AuthError, PermissionError):
    """Raised when a user is not allowed to perform a developer action."""

    def __init__(
        self,
        reason: str,
        user_id: str | None = None,
        question_id: str | None = None,
    ) -> None:
        message = "Developer access denied"
        if user_id:
            message += f" for user {user_id}"
        if question_id:
            message += f" on question {question_id}"
        if reason:
            message += f": {reason}"
        super().__init__(message)


class DeveloperProfileError(AuthError):
    """Raised when developer profile data cannot be retrieved or prepared."""

    default_message = "Developer profile operation failed"

    def __init__(self, action: str, user_id: str, details: str = "") -> None:
        message = f"Failed to {action} developer profile for user {user_id}"
        if details:
            message += f": {details}"
        super().__init__(message)


class DeveloperProfileNotSet(DeveloperProfileError, LookupError):
    """Raised when a developer profile is required but has not been configured."""

    def __init__(self, action: str, user_id: str, details: str = "") -> None:
        super().__init__(action, user_id, details or "Developer profile is not set")


class DeveloperStoragePathError(DeveloperProfileError):
    """Raised when a developer storage path cannot be generated or prepared."""
