from collections.abc import Sequence
from typing import Generic

from backend.authorization import ResourceAccessRevokeResult
from backend.authorization.resources.access_service import ResourceAccessService
from backend.authorization.types import AccessLevel, AccessModelT, ProfileT, ResourceT
from backend.shared import ID


class ResourceSharingService(Generic[AccessModelT, ProfileT, ResourceT]):
    def __init__(
        self, access_service: ResourceAccessService[AccessModelT, ProfileT, ResourceT]
    ) -> None:
        self._access_service = access_service

    async def share_with_user(
        self,
        owner_user_id: ID,
        target_user_id: ID,
        resource_id: ID,
        level: AccessLevel,
    ) -> AccessModelT:
        return await self._access_service.grant_access(
            owner_user_id,
            target_user_id,
            resource_id,
            level,
        )

    async def update_user_access(
        self,
        owner_user_id: ID,
        target_user_id: ID,
        resource_id: ID,
        level: AccessLevel,
    ) -> AccessModelT:
        return await self._access_service.update_access(
            owner_user_id,
            target_user_id,
            resource_id,
            level,
        )

    async def unshare_with_user(
        self,
        owner_user_id: ID,
        target_user_id: ID,
        resource_id: ID,
    ) -> ResourceAccessRevokeResult:
        return await self._access_service.revoke_access(
            owner_user_id,
            target_user_id,
            resource_id,
        )

    async def list_shared_with_me(
        self,
        user_id: ID,
    ) -> Sequence[AccessModelT]:
        return await self._access_service.list_access_shared_with(user_id)

    async def list_shared_by_me(self, user_id: ID) -> Sequence[AccessModelT]:
        return await self._access_service.list_access_shared_by(user_id)
