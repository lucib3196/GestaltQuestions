from collections.abc import Sequence
from typing import Generic, overload

from backend.authorization.exceptions import AccessPolicyError
from backend.authorization.profiles.service import ProfileService
from backend.authorization.resources.adapter import ResourceAccessAdapter
from backend.authorization.resources.exceptions import (
    ResourceAccessDenied,
    ResourceAccessOperationError,
    ResourceAccessValidationError,
)
from backend.authorization.types import (
    AccessDecision,
    AccessLevel,
    AccessModelT,
    Profile,
    ProfileT,
    ResourceAccessResult,
    ResourceAccessRevokeResult,
    ResourceProtocol,
    ResourceT,
)
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

    @overload
    async def check_access(
        self, requester: ID, resource: ID
    ) -> ResourceAccessResult[AccessModelT]: ...

    @overload
    async def check_access(
        self, requester: ProfileT, resource: ResourceT
    ) -> ResourceAccessResult[AccessModelT]: ...
    async def check_access(
        self, requester: ID | ProfileT, resource: ResourceT | ID
    ) -> ResourceAccessResult[AccessModelT]:
        requester_profile = await self._resolve_profile(requester)
        resource_model = await self._resolve_resource(resource)
        return await self._check_access(
            requester_profile,
            resource_model,
        )

    async def _check_access(
        self, requester: ProfileT, resource: ResourceT
    ) -> ResourceAccessResult[AccessModelT]:
        access = await self.retrieve_access(requester, resource)
        if access is None:
            return ResourceAccessResult(
                allowed=False,
                access=None,
                reason=f"{self._adapter.name} access does not exist",
            )

        return ResourceAccessResult(
            allowed=True,
            access=access,
            reason=f"{self._adapter.name} access exists",
        )

    async def retrieve_access(
        self, requester: ProfileT, resource: ResourceT
    ) -> AccessModelT | None:
        try:
            if await self._adapter.is_owner(resource, requester):
                existing = await self._adapter.get_access(resource, requester)
                if existing is None:
                    return await self._adapter.build_access(
                        resource,
                        granted_by=requester,
                        profile=requester,
                        level=AccessLevel.OWNER,
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
        except AccessPolicyError:
            raise
        except Exception as e:
            raise self._operation_error("retrieve", requester, resource, str(e)) from e

    @overload
    async def grant_access(
        self,
        owner: ProfileT,
        requester: ProfileT,
        resource: ResourceT,
        level: AccessLevel,
    ) -> AccessModelT: ...
    @overload
    async def grant_access(
        self,
        owner: ID,
        requester: ID,
        resource: ID,
        level: AccessLevel,
    ) -> AccessModelT: ...

    async def grant_access(
        self,
        owner: ProfileT | ID,
        requester: ProfileT | ID,
        resource: ResourceT | ID,
        level: AccessLevel,
    ) -> AccessModelT:
        owner_profile = await self._resolve_profile(owner)
        requester_profile = await self._resolve_profile(requester)
        resource_model = await self._resolve_resource(resource)
        return await self._grant_access(
            owner_profile,
            requester_profile,
            resource_model,
            level,
        )

    async def _grant_access(
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
            return await self._adapter.build_access(resource, owner, requester, level)
        except AccessPolicyError:
            raise
        except Exception as e:
            raise self._operation_error("grant", requester, resource, str(e)) from e

    @overload
    async def revoke_access(
        self, owner: ProfileT, target: ProfileT, resource: ResourceT
    ) -> ResourceAccessRevokeResult: ...

    @overload
    async def revoke_access(
        self, owner: ID, target: ID, resource: ID
    ) -> ResourceAccessRevokeResult: ...

    async def revoke_access(
        self, owner: ProfileT | ID, target: ProfileT | ID, resource: ResourceT | ID
    ) -> ResourceAccessRevokeResult:
        owner_profile = await self._resolve_profile(owner)
        requester_profile = await self._resolve_profile(target)
        resource_model = await self._resolve_resource(resource)
        return await self._revoke_access(
            owner_profile, requester_profile, resource_model
        )

    async def _revoke_access(
        self, owner: ProfileT, target: ProfileT, resource: ResourceT
    ) -> ResourceAccessRevokeResult:
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

            await self._adapter.remove_access(target, resource)
            return ResourceAccessRevokeResult(
                revoked=True,
                access_id=existing.id,
                access_level=existing.access_level,
                owner_profile_id=owner.id,
                target_profile_id=target.id,
                resource_id=resource.id,
                resource_name=self._adapter.name,
                reason=f"{self._adapter.name} access revoked",
            )
        except AccessPolicyError:
            raise
        except Exception as e:
            raise self._operation_error("revoke", target, resource, str(e)) from e

    @overload
    async def update_access(
        self,
        owner: ProfileT,
        requester: ProfileT,
        resource: ResourceT,
        level: AccessLevel,
    ) -> AccessModelT: ...

    @overload
    async def update_access(
        self,
        owner: ID,
        requester: ID,
        resource: ID,
        level: AccessLevel,
    ) -> AccessModelT: ...

    async def update_access(
        self,
        owner: ProfileT | ID,
        requester: ProfileT | ID,
        resource: ResourceT | ID,
        level: AccessLevel,
    ) -> AccessModelT:
        owner_profile = await self._resolve_profile(owner)
        requester_profile = await self._resolve_profile(requester)
        resource_model = await self._resolve_resource(resource)
        return await self._update_access(
            owner_profile, requester_profile, resource_model, level
        )

    async def _update_access(
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
                return await self._adapter.build_access(
                    resource, owner, requester, level
                )

            return await self._adapter.update_access(existing, level=level)
        except AccessPolicyError:
            raise
        except Exception as e:
            raise self._operation_error("update", requester, resource, str(e)) from e

    @overload
    async def has_access(
        self, requester: ID, resource: ID, minimum_level: AccessLevel = AccessLevel.VIEW
    ) -> AccessDecision: ...
    @overload
    async def has_access(
        self,
        requester: ProfileT,
        resource: ResourceT,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision: ...

    async def has_access(
        self,
        requester: ID | ProfileT,
        resource: ID | ResourceT,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision:
        requester_profile = await self._resolve_profile(requester)
        resource_model = await self._resolve_resource(resource)
        return await self._has_access(requester_profile, resource_model, minimum_level)

    async def _has_access(
        self,
        requester: ProfileT,
        resource: ResourceT,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision:
        try:
            access = await self.retrieve_access(requester, resource)
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
        except AccessPolicyError:
            raise
        except Exception as e:
            raise self._operation_error("check", requester, resource, str(e)) from e

    @overload
    async def list_access_shared_with(
        self, requester: ProfileT
    ) -> Sequence[AccessModelT]: ...

    @overload
    async def list_access_shared_with(
        self, requester: ID
    ) -> Sequence[AccessModelT]: ...

    async def list_access_shared_with(
        self, requester: ProfileT | ID
    ) -> Sequence[AccessModelT]:
        requester_profile = await self._resolve_profile(requester)
        try:
            return await self._adapter.list_access_granted_to(requester_profile)
        except AccessPolicyError:
            raise
        except Exception as e:
            raise ResourceAccessOperationError(
                "list",
                resource_name=self._adapter.name,
                profile_id=str(requester_profile.id),
                details=str(e),
            ) from e

    @overload
    async def list_access_shared_by(
        self, requester: ProfileT
    ) -> Sequence[AccessModelT]: ...

    @overload
    async def list_access_shared_by(self, requester: ID) -> Sequence[AccessModelT]: ...

    async def list_access_shared_by(
        self, requester: ProfileT | ID
    ) -> Sequence[AccessModelT]:
        requester_profile = await self._resolve_profile(requester)
        try:
            return await self._adapter.list_access_granted_by(requester_profile)
        except AccessPolicyError:
            raise
        except Exception as e:
            raise ResourceAccessOperationError(
                "list",
                resource_name=self._adapter.name,
                profile_id=str(requester_profile.id),
                details=str(e),
            ) from e

    async def _validate_owner(self, owner: ProfileT, resource: ResourceT) -> None:
        is_owner = await self._adapter.is_owner(resource, owner)
        if not is_owner:
            raise ResourceAccessDenied(
                "Only the owner can modify access",
                resource_name=self._adapter.name,
                resource_id=str(resource.id),
                profile_id=str(owner.id),
            )

    def _validate_assignable_level(self, level: AccessLevel) -> None:
        if level == AccessLevel.OWNER:
            raise ResourceAccessValidationError(
                "Cannot assign owner access level",
                resource_name=self._adapter.name,
            )

    # Resolves the profile and resource
    async def _resolve_profile(self, profile_or_id: ProfileT | ID) -> ProfileT:
        if isinstance(profile_or_id, Profile):
            return profile_or_id
        return await self._profile_service.get_profile(profile_or_id)

    async def _resolve_resource(self, resource_or_id: ResourceT | ID) -> ResourceT:
        if isinstance(resource_or_id, ResourceProtocol):
            return resource_or_id
        resource = await self._adapter.get_resource(resource_or_id)
        if resource is None:
            raise ResourceAccessValidationError(
                "Resource does not exist",
                resource_name=self._adapter.name,
                resource_id=str(resource_or_id),
            )
        return resource

    # Exceptions Raisers

    def _validation_error(
        self,
        reason: str,
        profile: ProfileT,
        resource: ResourceT,
    ) -> ResourceAccessValidationError:
        return ResourceAccessValidationError(
            reason,
            resource_name=self._adapter.name,
            resource_id=str(resource.id),
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
            resource_id=str(resource.id),
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
