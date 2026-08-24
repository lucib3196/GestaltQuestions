from backend.authorization.exceptions import AuthorizationError


class RoleError(AuthorizationError):
    """Base exception for role failures."""

    default_message = "Role operation failed"

    def __init__(
        self,
        message: str | None = None,
        *,
        operation: str | None = None,
        details: str | None = None,
    ) -> None:
        self.operation = operation
        self.details = details

        final_message = message or self.default_message
        if operation:
            final_message = f"{final_message} during {operation}"
        if details:
            final_message = f"{final_message}: {details}"

        super().__init__(final_message)


class RoleNotFound(RoleError, LookupError):
    """Raised when a role cannot be found."""

    def __init__(
        self,
        role: str | None = None,
        message: str | None = None,
        details: str | None = None,
    ) -> None:
        if message is None:
            message = f"Role '{role}' not found" if role else "Role not found"
        super().__init__(message)


class RoleCreateError(RoleError):
    """Raised when a role cannot be created."""

    default_message = "Failed to create role"


class RoleReadError(RoleError):
    """Raised when role data cannot be retrieved."""

    default_message = "Failed to retrieve role"


class RoleAssignmentError(RoleError):
    """Raised when a role cannot be assigned to a user."""

    default_message = "Failed to assign role to user"


class RoleSeedError(RoleError):
    """Raised when default roles cannot be seeded."""

    default_message = "Failed to seed roles"
