from .exceptions import (
    RoleAssignmentError,
    RoleCreateError,
    RoleError,
    RoleNotFound,
    RoleReadError,
    RoleSeedError,
)
from .schemas import RoleRead, UpdateUserRole, UserRoles

__all__ = [
    "RoleAssignmentError",
    "RoleCreateError",
    "RoleDB",
    "RoleError",
    "RoleNotFound",
    "RoleRead",
    "RoleReadError",
    "RoleSeedError",
    "UpdateUserRole",
    "UserRoles",
]


def __getattr__(name: str):
    if name == "RoleDB":
        from .repository import RoleDB

        return RoleDB
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
