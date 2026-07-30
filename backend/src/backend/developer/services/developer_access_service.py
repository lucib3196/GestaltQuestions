from dataclasses import dataclass

from backend.auth.schemas import UserRoles
from backend.auth.services.user_manager import UserManager
from backend.core import logger
from backend.developer.exceptions import DeveloperAccessDenied
from backend.shared import ID
from backend.developer.schema import AccessDecision


class DeveloperAccessService:
    """Owns developer/admin role checks only."""

    def __init__(self, user_manager: UserManager):
        self._user_manager = user_manager

    async def has_developer_role(self, user_id: ID) -> AccessDecision:
        """Return whether the user has admin or developer privileges."""
        logger.debug("Checking developer role for user %s", user_id)
        try:
            user = await self._user_manager.get_user(user_id)
            if user is None:
                logger.warning(
                    "Developer role check failed: user %s not found", user_id
                )
                return AccessDecision(False, f"User '{user_id}' not found")

            roles = await self._user_manager.get_user_role(user_id)
            role_names = {r.name.strip().lower() for r in roles}
            if (
                UserRoles.ADMIN.value in role_names
                or UserRoles.DEVELOPER.value in role_names
            ):
                logger.debug("Developer access granted for user %s", user_id)
                return AccessDecision(True, "Developer access granted")

            logger.warning("Developer role required for user %s", user_id)
            return AccessDecision(
                False, "Developer role is required to perform this action"
            )
        except DeveloperAccessDenied:
            raise
        except Exception as e:
            logger.warning("Failed checking developer role for user %s: %s", user_id, e)
            raise DeveloperAccessDenied(
                "Failed to determine developer role", user_id=str(user_id)
            ) from e

    async def require_developer_access(self, user_id: ID) -> None:
        """Raise when the user does not have developer-level access."""
        access = await self.has_developer_role(user_id)
        if not access.allowed:
            raise DeveloperAccessDenied(access.reason, user_id=str(user_id))
