from abc import ABC, abstractmethod
from collections.abc import Iterable

from backend.access_policy.exceptions import AccessPolicyDenied
from backend.access_policy.schema import AccessDecision
from backend.auth.schemas import UserRoles
from backend.auth.services.user_manager import UserManager
from backend.core import logger
from backend.shared import ID


class AccessPolicy(ABC):
    """Base contract for deciding whether a user can perform an action."""

    @abstractmethod
    async def evaluate(self, user_id: ID) -> AccessDecision:
        """Return whether the user is allowed by this policy."""

    @abstractmethod
    async def require_access(self, user_id: ID) -> None:
        """Raise when the user is not allowed by this policy."""


class RoleAccessPolicy(AccessPolicy):
    """Allows access when the user has one of the configured roles."""

    def __init__(
        self,
        user_manager: UserManager,
        allowed_roles: Iterable[UserRoles],
        access_name: str,
    ) -> None:
        self._user_manager = user_manager
        self._allowed_roles = {role.value for role in allowed_roles}
        self._access_name = access_name

    async def evaluate(self, user_id: ID) -> AccessDecision:
        try:
            user = await self._user_manager.get_user(user_id)
            if user is None:
                return AccessDecision(False, f"User '{user_id}' not found")
            roles = await self._user_manager.get_user_role(user_id)
            role_names = {role.name.strip().lower() for role in roles}

            if role_names & self._allowed_roles:
                return AccessDecision(True, f"{self._access_name} access granted")
            logger.debug(f"{self._access_name} role required for user %s", user_id)
            return AccessDecision(
                False,
                f"{self._access_name} access requires one of: "
                f"{', '.join(sorted(self._allowed_roles))}",
            )
        except Exception as e:
            return AccessDecision(
                False,
                f"Failed to determine access level for user {user_id}. Reason: {e!s}",
            )

    async def require_access(self, user_id: ID) -> None:
        access = await self.evaluate(user_id)
        if not access.allowed:
            raise AccessPolicyDenied(
                access.reason,
                user_id=str(user_id),
                access_name=self._access_name,
            )
