from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import Generic

from backend.access_policy.schema import AccessLevel, AccessModelT, ProfileT, ResourceT
from backend.shared import ID


class ResourceAccessAdapter(ABC, Generic[AccessModelT, ProfileT, ResourceT]):
    """Base adapter for resource access persistence and ownership checks."""

    def __init__(self, name: str | None = None) -> None:
        """Initialize the adapter with a display name for policy errors."""
        if name:
            self._name = name
        else:
            self._name = "Resource"

    @abstractmethod
    async def get_resource(
        self,
        resource_id: ID,
    ) -> ResourceT | None:
        """Return the resource for the given ID, or None when it does not exist."""
        ...

    @abstractmethod
    async def get_access(
        self,
        resource: ResourceT,
        profile: ProfileT,
    ) -> AccessModelT | None:
        """Return the access grant for a profile and resource, if one exists."""
        ...

    @abstractmethod
    async def build_access(
        self,
        resource: ResourceT,
        granted_by: ProfileT,
        profile: ProfileT,
        level: AccessLevel,
    ) -> AccessModelT:
        """Create and return an access grant for a profile on a resource."""
        ...

    @abstractmethod
    async def update_access(
        self,
        access: AccessModelT,
        level: AccessLevel,
    ) -> AccessModelT:
        """Update and return an existing access grant with a new level."""
        ...

    @abstractmethod
    async def remove_access(
        self,
        target: ProfileT,
        resource: ResourceT,
    ) -> None:
        """Remove a profile's access grant for a resource."""
        ...

    @abstractmethod
    async def list_access_granted_to(self, profile: ProfileT) -> Sequence[AccessModelT]:
        """Return access grants assigned to the profile."""
        ...

    @abstractmethod
    async def list_access_granted_by(self, profile: ProfileT) -> Sequence[AccessModelT]:
        """Return access grants created by the profile."""
        ...

    @abstractmethod
    async def is_owner(
        self,
        resource: ResourceT,
        profile: ProfileT,
    ) -> bool:
        """Return whether the profile owns the resource."""
        ...

    async def is_public(
        self,
        resource: ResourceT,
    ) -> bool:
        """Return whether the resource is viewable without an explicit grant."""
        return False

    def get_access_level(self, access: AccessModelT) -> AccessLevel:
        """Return the access level stored on an access grant."""
        return access.access_level

    @property
    def name(self) -> str:
        """Return the resource name used in policy messages."""
        return self._name
