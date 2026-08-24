from collections.abc import Callable
from typing import Generic, Protocol, TypeVar

from backend.accounts import User
from backend.authorization import AccessLevel
from backend.authorization.exceptions import AccessPolicyDenied
from backend.authorization.profiles import ProfileService
from backend.authorization.profiles.exceptions import ProfileNotSet
from backend.authorization.resources.access_service import ResourceAccessService
from backend.authorization.types import (
    AccessModelT,
    Profile,
    ProfileT,
    ResourceProtocol,
    ResourceT,
)
from backend.shared import ID

ActionT = TypeVar("ActionT", contravariant=True)
ResourceIdOrModelT = TypeVar("ResourceIdOrModelT")


class ActionPolicy(Protocol[ActionT]):
    def required_level(self, action: ActionT) -> AccessLevel: ...


DeniedErrorFactory = Callable[[str, str | None, str | None], Exception]


class ResourceAuthorizer(Generic[AccessModelT, ProfileT, ResourceT, ActionT]):
    def __init__(
        self,
        access: ResourceAccessService[AccessModelT, ProfileT, ResourceT],
        profile: ProfileService[ProfileT],
        policy: ActionPolicy[ActionT],
        denied_error: DeniedErrorFactory,
    ) -> None:
        self._access = access
        self._profile = profile
        self._policy = policy
        self._denied_error = denied_error

    async def require_action(
        self,
        requester: User | ID | ProfileT,
        resource: ResourceT | ID,
        action: ActionT,
    ) -> None:
        profile = await self.resolve_profile(requester)
        required_level = self._policy.required_level(action)
        decision = await self._access.has_access(profile, resource, required_level)
        if not decision.allowed:
            raise self._denied_error(
                decision.reason,
                str(profile.id),
                self._resource_id(resource),
            )

    async def check_access(
        self,
        requester: User | ID | ProfileT,
        resource: ResourceT | ID,
    ):
        profile = await self.resolve_profile(requester)
        return await self._access.check_access(profile, resource)

    async def resolve_profile(self, requester: User | ID | ProfileT) -> ProfileT:
        if isinstance(requester, Profile):
            return requester
        try:
            return await self._profile.get_profile(requester)
        except (AccessPolicyDenied, ProfileNotSet):
            raise
        except Exception:
            raise

    @staticmethod
    def _resource_id(resource: ResourceT | ID) -> str | None:
        if isinstance(resource, ResourceProtocol):
            return str(resource.id)
        return str(resource)
