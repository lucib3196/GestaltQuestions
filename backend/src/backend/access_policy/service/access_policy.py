from abc import ABC, abstractmethod
from collections.abc import Iterable
from backend.access_policy.schema import AccessDecision

from backend.auth.schemas import UserRoles
from backend.auth.services.user_manager import UserManager
from backend.shared import ID


class AccessPolicy(ABC):
    """Base contract for deciding whether a user can perform an action."""

    @abstractmethod
    async def evaluate(self, user_id: ID) -> AccessDecision:
        """Return whether the user is allowed by this policy."""


class RoleAccessPolicy(AccessPolicy):
    """Allows access when the user has one of the configured roles."""

    def __init__(
        self,
        user_manager: UserManager,
        allowed_roles: Iterable[UserRoles],
        access_name: str,
    ):
        self._user_manager = user_manager
        self._allowed_roles = {role.value for role in allowed_roles}
        self._access_name = access_name

    async def evaluate(self, user_id: ID) -> AccessDecision:
        user = await self._user_manager.get_user(user_id)
        if user is None:
            return AccessDecision(False, f"User '{user_id}' not found")
        roles = await self._user_manager.get_user_role(user_id)
        role_names = {role.name.strip().lower() for role in roles}
        if role_names & self._allowed_roles:
            return AccessDecision(True, f"{self._access_name} access granted")
        return AccessDecision(
            False,
            f"{self._access_name} access requires one of: "
            f"{', '.join(sorted(self._allowed_roles))}",
        )

