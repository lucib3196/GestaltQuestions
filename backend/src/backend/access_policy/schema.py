from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol, TypeVar
from uuid import UUID


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


# Profile must have a minimum of an ID and user_id
class Profile(Protocol):
    id: UUID
    user_id: UUID


ProfileT = TypeVar("ProfileT", bound=Profile)


class ResourceProtocol(Protocol):
    id: UUID | None


ResourceT = TypeVar("ResourceT", bound=ResourceProtocol)
