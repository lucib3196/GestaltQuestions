from collections.abc import Sequence
from dataclasses import dataclass
from uuid import UUID
from typing import Generic
from backend.authorization.types import (
    AccessLevel,
    ProfileT,
    AccessModelT,
    ResourceAccessRevokeResult,
    ResourceT,
    AccessDetailRead,
)
from backend.authorization import ResourceAccessRevokeResult
from backend.authorization.resources.access_service import ResourceAccessService
from backend.authorization.types import AccessDetailRead, AccessLevel
from backend.shared import ID


@dataclass
class FailedBatchResult:
    resource_id: UUID | str | None
    target_user_id: UUID | str | None
    reason: str


@dataclass
class BatchResult[BatchAccessT]:
    shared: list[BatchAccessT]
    failed: list[FailedBatchResult]


class ResourceSharingService(Generic[AccessModelT, ProfileT, ResourceT]):
    def __init__(
        self,
        access_service: ResourceAccessService[
            AccessModelT, ProfileT, ResourceT, AccessDetailRead
        ],
        self,
        access_service: ResourceAccessService[
            AccessModelT, ProfileT, ResourceT, AccessDetailRead
        ],
    ) -> None:
        self._access_service = access_service

    async def share_with_user(
        self,
        owner: ID | ProfileT,
        target: ID | ProfileT,
        resource: ID | ResourceT,
        level: AccessLevel,
    ) -> AccessModelT:
        return await self._access_service.grant_access(
            owner,
            target,
            resource,
            level,
        )

    async def batch_share_resources(
        self,
        owner: ID | ProfileT,
        targets: list[ID | ProfileT],
        resources: list[ID | ResourceT],
        level: AccessLevel,
    ) -> BatchResult[AccessModelT]:
        shared: list[AccessModelT] = []
        failed: list[FailedBatchResult] = []
        for resource in resources:
            for target in targets:
                try:
                    access = await self.update_user_access(
                        owner, target, resource, level
                    )
                # Maybe make this tigher
                except Exception as e:
                    failed.append(
                        FailedBatchResult(
                            resource_id=str(resource),
                            target_user_id=str(target),
                            reason=f"Failed to share question {e!s}",
                        )
                    )
                    continue

                shared.append(access)
        return BatchResult(shared=shared, failed=failed)

    async def update_user_access(
        self,
        owner: ID | ProfileT,
        target: ID | ProfileT,
        resource: ID | ResourceT,
        level: AccessLevel,
    ) -> AccessModelT:
        return await self._access_service.update_access(
            owner,
            target,
            resource,
            level,
        )

    async def unshare_with_user(
        self,
        owner: ID | ProfileT,
        target: ID | ProfileT,
        resource: ID | ResourceT,
    ) -> ResourceAccessRevokeResult:
        return await self._access_service.revoke_access(
            owner,
            target,
            resource,
        )

    async def list_shared_with_me(
        self,
        user_id: ID,
    ) -> Sequence[AccessModelT]:
        return await self._access_service.list_access_shared_with(user_id)

    async def list_shared_by_me(self, user_id: ID) -> Sequence[AccessModelT]:
        return await self._access_service.list_access_shared_by(user_id)
