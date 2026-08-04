from abc import ABC, abstractmethod
from typing import Generic

from backend.access_policy.schema import AccessLevel, AccessModelT, ProfileT, ResourceT
from backend.shared import ID


class ResourceAccessAdapter(ABC, Generic[AccessModelT, ProfileT, ResourceT]):
    def __init__(self, name: str | None = None) -> None:
        if name:
            self._name = name
        else:
            self._name = "Resource"

    @abstractmethod
    async def get_resource(
        self,
        resource_id: ID,
    ) -> ResourceT | None: ...

    @abstractmethod
    async def get_access(
        self,
        resource: ResourceT,
        profile: ProfileT,
    ) -> AccessModelT | None: ...

    @abstractmethod
    async def build_access(
        self,
        resource: ResourceT,
        profile: ProfileT,
        level: AccessLevel,
    ) -> AccessModelT: ...

    @abstractmethod
    async def update_access(
        self,
        access: AccessModelT,
        level: AccessLevel,
    ) -> AccessModelT: ...

    @abstractmethod
    async def remove_access(
        self,
        target: ProfileT,
        resource: ResourceT,
    ) -> AccessModelT: ...

    @abstractmethod
    async def is_owner(
        self,
        resource: ResourceT,
        profile: ProfileT,
    ) -> bool: ...

    async def is_public(
        self,
        resource: ResourceT,
    ) -> bool:
        return False

    def get_access_level(self, access: AccessModelT) -> AccessLevel:
        return access.access_level

    @property
    def name(self) -> str:
        return self._name
