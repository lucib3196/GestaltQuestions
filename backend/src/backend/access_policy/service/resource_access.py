from typing import Generic

from backend.access_policy.exceptions import (
    ResourceAccessDenied,
    ResourceAccessError,
    ResourceAccessOperationError,
    ResourceAccessValidationError,
)
from backend.access_policy.schema import (
    AccessDecision,
    AccessLevel,
    AccessModelT,
    ProfileT,
    ResourceT,
)
from backend.access_policy.service.profile_service import ProfileService
from backend.access_policy.service.resource_adapter import ResourceAccessAdapter
from backend.shared import ID


class ResourceAccessService(Generic[AccessModelT, ProfileT, ResourceT]):
    _ACCESS_LEVEL_RANK = {
        AccessLevel.VIEW: 1,
        AccessLevel.EDIT: 2,
        AccessLevel.FULL: 3,
        AccessLevel.OWNER: 4,
    }

    def __init__(
        self,
        adapter: ResourceAccessAdapter[AccessModelT, ProfileT, ResourceT],
        profile_service: ProfileService[ProfileT],
    ) -> None:
        self._adapter = adapter
        self._profile_service = profile_service

    async def get_access(
        self, requester: ProfileT, resource: ResourceT
    ) -> AccessModelT | None:
        try:
            if await self._adapter.is_owner(resource, requester):
                existing = await self._adapter.get_access(resource, requester)
                if existing is None:
                    return await self._adapter.build_access(
                        resource,
                        requester,
                        AccessLevel.OWNER,
                    )
                if existing.access_level != AccessLevel.OWNER:
                    return await self._adapter.update_access(
                        existing,
                        level=AccessLevel.OWNER,
                    )
                return existing

            access = await self._adapter.get_access(resource, requester)
            if access is not None:
                return access

            return None
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error("retrieve", requester, resource, str(e)) from e

    async def get_access_by_id(
        self,
        requester_id: ID,
        resource_id: ID,
    ) -> AccessModelT | None:
        try:
            requester = await self._get_profile(requester_id)
            resource = await self._get_resource(resource_id)
            return await self.get_access(requester, resource)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error_by_id(
                "retrieve",
                requester_id,
                resource_id,
                str(e),
            ) from e

    async def grant_access(
        self,
        owner: ProfileT,
        requester: ProfileT,
        resource: ResourceT,
        level: AccessLevel,
    ) -> AccessModelT:
        try:
            await self._validate_owner(owner, resource)
            self._validate_assignable_level(level)

            existing = await self._adapter.get_access(resource, requester)
            if existing is not None:
                raise self._validation_error(
                    "Access already exists",
                    requester,
                    resource,
                )

            return await self._adapter.build_access(resource, requester, level)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error("grant", requester, resource, str(e)) from e

    async def grant_access_by_id(
        self,
        owner_id: ID,
        requester_id: ID,
        resource_id: ID,
        level: AccessLevel,
    ) -> AccessModelT:
        try:
            owner = await self._get_profile(owner_id)
            requester = await self._get_profile(requester_id)
            resource = await self._get_resource(resource_id)
            return await self.grant_access(owner, requester, resource, level)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error_by_id(
                "grant",
                requester_id,
                resource_id,
                str(e),
            ) from e

    async def update_access(
        self,
        owner: ProfileT,
        requester: ProfileT,
        resource: ResourceT,
        level: AccessLevel,
    ) -> AccessModelT:
        try:
            await self._validate_owner(owner, resource)
            self._validate_assignable_level(level)

            existing = await self._adapter.get_access(resource, requester)
            if existing is None:
                return await self._adapter.build_access(resource, requester, level)

            return await self._adapter.update_access(existing, level=level)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error("update", requester, resource, str(e)) from e

    async def update_access_by_id(
        self,
        owner_id: ID,
        requester_id: ID,
        resource_id: ID,
        level: AccessLevel,
    ) -> AccessModelT:
        try:
            owner = await self._get_profile(owner_id)
            requester = await self._get_profile(requester_id)
            resource = await self._get_resource(resource_id)
            return await self.update_access(owner, requester, resource, level)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error_by_id(
                "update",
                requester_id,
                resource_id,
                str(e),
            ) from e

    async def revoke_access(
        self, owner: ProfileT, target: ProfileT, resource: ResourceT
    ) -> AccessModelT:
        try:
            await self._validate_owner(owner, resource)

            if await self._adapter.is_owner(resource, target):
                raise self._validation_error(
                    "Cannot revoke owner access",
                    target,
                    resource,
                )

            existing = await self._adapter.get_access(resource, target)
            if existing is None:
                raise self._validation_error(
                    "Access does not exist",
                    target,
                    resource,
                )

            return await self._adapter.remove_access(target, resource)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error("revoke", target, resource, str(e)) from e

    async def revoke_access_by_id(
        self,
        owner_id: ID,
        target_id: ID,
        resource_id: ID,
    ) -> AccessModelT:
        try:
            owner = await self._get_profile(owner_id)
            target = await self._get_profile(target_id)
            resource = await self._get_resource(resource_id)
            return await self.revoke_access(owner, target, resource)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error_by_id(
                "revoke",
                target_id,
                resource_id,
                str(e),
            ) from e

    async def has_access(
        self,
        requester: ProfileT,
        resource: ResourceT,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision:
        try:
            access = await self.get_access(requester, resource)
            if access is not None:
                has_level = (
                    self._ACCESS_LEVEL_RANK[access.access_level]
                    >= self._ACCESS_LEVEL_RANK[minimum_level]
                )
                if not has_level:
                    return AccessDecision(
                        False,
                        (
                            f"{self._adapter.name} access level {access.access_level} "
                            f"is below required level {minimum_level}"
                        ),
                    )

                return AccessDecision(True, f"{self._adapter.name} access granted")

            if minimum_level == AccessLevel.VIEW and await self._adapter.is_public(
                resource
            ):
                return AccessDecision(
                    True,
                    f"{self._adapter.name} public view access granted",
                )

            return AccessDecision(
                False,
                f"{self._adapter.name} access does not exist",
            )
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error("check", requester, resource, str(e)) from e

    async def has_access_by_id(
        self,
        requester_id: ID,
        resource_id: ID,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision:
        try:
            requester = await self._get_profile(requester_id)
            resource = await self._get_resource(resource_id)
            return await self.has_access(requester, resource, minimum_level)
        except ResourceAccessError:
            raise
        except Exception as e:
            raise self._operation_error_by_id(
                "check",
                requester_id,
                resource_id,
                str(e),
            ) from e

    async def _validate_owner(self, owner: ProfileT, resource: ResourceT) -> None:
        is_owner = await self._adapter.is_owner(resource, owner)
        if not is_owner:
            raise ResourceAccessDenied(
                "Only the owner can modify access",
                resource_name=self._adapter.name,
                resource_id=self._resource_id(resource),
                profile_id=str(owner.id),
            )

    def _validate_assignable_level(self, level: AccessLevel) -> None:
        if level == AccessLevel.OWNER:
            raise ResourceAccessValidationError(
                "Cannot assign owner access level",
                resource_name=self._adapter.name,
            )

    async def _get_profile(self, user_id: ID) -> ProfileT:
        return await self._profile_service.get_profile(user_id)

    async def _get_resource(self, resource_id: ID) -> ResourceT:
        resource = await self._adapter.get_resource(resource_id)
        if resource is None:
            raise ResourceAccessValidationError(
                "Resource does not exist",
                resource_name=self._adapter.name,
                resource_id=str(resource_id),
            )
        return resource

    def _validation_error(
        self,
        reason: str,
        profile: ProfileT,
        resource: ResourceT,
    ) -> ResourceAccessValidationError:
        return ResourceAccessValidationError(
            reason,
            resource_name=self._adapter.name,
            resource_id=self._resource_id(resource),
            profile_id=str(profile.id),
        )

    def _operation_error(
        self,
        action: str,
        profile: ProfileT,
        resource: ResourceT,
        details: str,
    ) -> ResourceAccessOperationError:
        return ResourceAccessOperationError(
            action,
            resource_name=self._adapter.name,
            resource_id=self._resource_id(resource),
            profile_id=str(profile.id),
            details=details,
        )

    def _operation_error_by_id(
        self,
        action: str,
        profile_id: ID,
        resource_id: ID,
        details: str,
    ) -> ResourceAccessOperationError:
        return ResourceAccessOperationError(
            action,
            resource_name=self._adapter.name,
            resource_id=str(resource_id),
            profile_id=str(profile_id),
            details=details,
        )

    def _resource_id(self, resource: ResourceT) -> str | None:
        if resource.id is None:
            return None
        return str(resource.id)
