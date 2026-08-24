from backend.authorization.exceptions import AccessPolicyError


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
