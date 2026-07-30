class AccessPolicyError(Exception):
    """Base exception for access policy errors."""


class AccessPolicyDenied(AccessPolicyError, PermissionError):
    """Raised when an access policy denies a user."""

    def __init__(
        self,
        reason: str,
        user_id: str | None = None,
        access_name: str | None = None,
    ) -> None:
        message = "Access denied"
        if access_name:
            message += f" for {access_name}"
        if user_id:
            message += f" for user {user_id}"
        if reason:
            message += f": {reason}"
        super().__init__(message)
