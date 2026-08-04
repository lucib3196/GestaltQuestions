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


class ResourceAccessError(AccessPolicyError):
    """Base exception for resource access failures."""


class ResourceAccessDenied(ResourceAccessError, PermissionError):
    """Raised when a profile is not allowed to access or mutate a resource."""

    def __init__(
        self,
        reason: str,
        resource_name: str | None = None,
        resource_id: str | None = None,
        profile_id: str | None = None,
    ) -> None:
        message = "Resource access denied"
        if resource_name:
            message += f" for {resource_name}"
        if resource_id:
            message += f" {resource_id}"
        if profile_id:
            message += f" by profile {profile_id}"
        if reason:
            message += f": {reason}"
        super().__init__(message)


class ResourceAccessOperationError(ResourceAccessError):
    """Raised when a resource access operation fails unexpectedly."""

    def __init__(
        self,
        action: str,
        resource_name: str | None = None,
        resource_id: str | None = None,
        profile_id: str | None = None,
        details: str = "",
    ) -> None:
        message = f"Failed to {action} resource access"
        if resource_name:
            message += f" for {resource_name}"
        if resource_id:
            message += f" {resource_id}"
        if profile_id:
            message += f" and profile {profile_id}"
        if details:
            message += f": {details}"
        super().__init__(message)


class ResourceAccessValidationError(ResourceAccessError, ValueError):
    """Raised when a resource access request is invalid."""

    def __init__(
        self,
        reason: str,
        resource_name: str | None = None,
        resource_id: str | None = None,
        profile_id: str | None = None,
    ) -> None:
        message = "Invalid resource access request"
        if resource_name:
            message += f" for {resource_name}"
        if resource_id:
            message += f" {resource_id}"
        if profile_id:
            message += f" and profile {profile_id}"
        if reason:
            message += f": {reason}"
        super().__init__(message)
