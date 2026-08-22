from backend.authorization.exceptions import AccessPolicyError


class ProfileError(AccessPolicyError):
    """Base exception for profile lookup/setup failures."""


class ProfileAccessDenied(ProfileError, PermissionError):
    """Raised when a user does not satisfy the profile policy."""

    def __init__(
        self,
        reason: str,
        user_id: str | None = None,
        profile_name: str | None = None,
    ) -> None:
        message = "Profile access denied"
        if profile_name:
            message += f" for {profile_name}"
        if user_id:
            message += f" for user {user_id}"
        if reason:
            message += f": {reason}"
        super().__init__(message)


class ProfileNotSet(ProfileError, LookupError):
    """Raised when a required profile does not exist."""

    def __init__(
        self,
        user_id: str,
        profile_name: str | None = None,
        details: str = "",
    ) -> None:
        message = "Profile is not set"
        if profile_name:
            message += f" for {profile_name}"
        message += f" for user {user_id}"
        if details:
            message += f": {details}"
        super().__init__(message)


class ProfileOperationError(ProfileError):
    """Raised when a profile operation fails."""

    def __init__(
        self,
        action: str,
        user_id: str,
        profile_name: str | None = None,
        details: str = "",
    ) -> None:
        message = f"Failed to {action} profile"
        if profile_name:
            message += f" for {profile_name}"
        message += f" for user {user_id}"
        if details:
            message += f": {details}"
        super().__init__(message)
