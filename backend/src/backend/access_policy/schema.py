from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol, TypeVar, runtime_checkable
from uuid import UUID
from typing import Generic


@dataclass
class AccessDecision:
    allowed: bool
    reason: str


# AccessLevel
class AccessLevel(StrEnum):
    VIEW = "view"
    EDIT = "edit"
    FULL = "full"
    OWNER = "owner"


# Access Model Protocol must follw the shape
class AccessModelProtocol(Protocol):
    id: UUID | None
    access_level: AccessLevel


AccessModelT = TypeVar("AccessModelT", bound=AccessModelProtocol)


@dataclass
class ResourceAccessResult(Generic[AccessModelT]):
    allowed: bool
    access: AccessModelT | None
    reason: str


@dataclass
class ResourceAccessRevokeResult:
    revoked: bool
    access_id: UUID | None
    access_level: AccessLevel
    owner_profile_id: UUID
    target_profile_id: UUID
    resource_id: UUID | None
    resource_name: str
    reason: str


# Profile must have a minimum of an ID and user_id
@runtime_checkable
class Profile(Protocol):
    id: UUID
    user_id: UUID


ProfileT = TypeVar("ProfileT", bound=Profile)

@runtime_checkable
class ResourceProtocol(Protocol):
    id: UUID | None


ResourceT = TypeVar("ResourceT", bound=ResourceProtocol)
