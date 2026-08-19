from .exceptions import AccessPolicyDenied, AccessPolicyError, AuthorizationError
from .types import (
    AccessDecision,
    AccessLevel,
    AccessModelProtocol,
    AccessModelT,
    Profile,
    ProfileT,
    ResourceAccessResult,
    ResourceAccessRevokeResult,
    ResourceProtocol,
    ResourceT,
)

__all__ = [
    "AccessDecision",
    "AccessLevel",
    "AccessModelProtocol",
    "AccessModelT",
    "AccessPolicy",
    "AccessPolicyDenied",
    "AccessPolicyError",
    "AuthorizationError",
    "Profile",
    "ProfileAccessDenied",
    "ProfileError",
    "ProfileNotSet",
    "ProfileOperationError",
    "ProfileService",
    "ProfileT",
    "ResourceAccessAdapter",
    "ResourceAccessDenied",
    "ResourceAccessError",
    "ResourceAccessOperationError",
    "ResourceAccessResult",
    "ResourceAccessRevokeResult",
    "ResourceAccessService",
    "ResourceAccessValidationError",
    "ResourceProtocol",
    "ResourceSharingService",
    "ResourceT",
    "RoleAccessPolicy",
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
    if name in {
        "ProfileAccessDenied",
        "ProfileError",
        "ProfileNotSet",
        "ProfileOperationError",
        "ProfileService",
    }:
        from .profiles import (
            ProfileAccessDenied,
            ProfileError,
            ProfileNotSet,
            ProfileOperationError,
            ProfileService,
        )

        return {
            "ProfileAccessDenied": ProfileAccessDenied,
            "ProfileError": ProfileError,
            "ProfileNotSet": ProfileNotSet,
            "ProfileOperationError": ProfileOperationError,
            "ProfileService": ProfileService,
        }[name]

    if name in {"AccessPolicy", "RoleAccessPolicy"}:
        from .policies import AccessPolicy, RoleAccessPolicy

        return {"AccessPolicy": AccessPolicy, "RoleAccessPolicy": RoleAccessPolicy}[
            name
        ]

    if name in {
        "ResourceAccessAdapter",
        "ResourceAccessDenied",
        "ResourceAccessError",
        "ResourceAccessOperationError",
        "ResourceAccessService",
        "ResourceAccessValidationError",
        "ResourceSharingService",
    }:
        from .resources import (
            ResourceAccessAdapter,
            ResourceAccessDenied,
            ResourceAccessError,
            ResourceAccessOperationError,
            ResourceAccessService,
            ResourceAccessValidationError,
            ResourceSharingService,
        )

        return {
            "ResourceAccessAdapter": ResourceAccessAdapter,
            "ResourceAccessDenied": ResourceAccessDenied,
            "ResourceAccessError": ResourceAccessError,
            "ResourceAccessOperationError": ResourceAccessOperationError,
            "ResourceAccessService": ResourceAccessService,
            "ResourceAccessValidationError": ResourceAccessValidationError,
            "ResourceSharingService": ResourceSharingService,
        }[name]

    if name in {
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
    }:
        from .roles import (
            RoleAssignmentError,
            RoleCreateError,
            RoleDB,
            RoleError,
            RoleNotFound,
            RoleRead,
            RoleReadError,
            RoleSeedError,
            UpdateUserRole,
            UserRoles,
        )

        return {
            "RoleAssignmentError": RoleAssignmentError,
            "RoleCreateError": RoleCreateError,
            "RoleDB": RoleDB,
            "RoleError": RoleError,
            "RoleNotFound": RoleNotFound,
            "RoleRead": RoleRead,
            "RoleReadError": RoleReadError,
            "RoleSeedError": RoleSeedError,
            "UpdateUserRole": UpdateUserRole,
            "UserRoles": UserRoles,
        }[name]

    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
