from abc import ABC, abstractmethod
from typing import Generic

from backend.authorization.exceptions import AccessPolicyDenied
from backend.authorization.policies.role_policy import RoleAccessPolicy
from backend.authorization.profiles.exceptions import (
    ProfileAccessDenied,
    ProfileNotSet,
    ProfileOperationError,
)
from backend.authorization.types import ProfileT
from backend.shared import ID


class ProfileService(Generic[ProfileT], ABC):
    """Base service for policy-protected profile lookup and setup."""

    profile_name = "Profile"

    def __init__(self, policy: RoleAccessPolicy) -> None:
        self._policy = policy

    async def get_profile(self, user_id: ID) -> ProfileT:
        """Return an existing profile after enforcing profile policy."""
        await self._require_profile_policy(user_id)
        try:
            profile = await self._get_profile(user_id)
        except ProfileNotSet:
            raise
        except Exception as e:
            raise self._operation_error("retrieve", user_id, str(e)) from e

        if profile is None:
            raise self._not_set_error(user_id)

        return profile

    async def set_profile(self, user_id: ID) -> ProfileT:
        """Create or update a profile after enforcing profile policy."""
        await self._require_profile_policy(user_id)
        try:
            return await self._set_profile(user_id)
        except Exception as e:
            raise self._operation_error("set", user_id, str(e)) from e

    async def get_or_create_profile(self, user_id: ID) -> ProfileT:
        """Return an existing profile, or create one when it is not set."""
        try:
            return await self.get_profile(user_id)
        except ProfileNotSet:
            return await self.set_profile(user_id)

    async def _require_profile_policy(self, user_id: ID) -> None:
        try:
            await self._policy.require_access(user_id)
        except AccessPolicyDenied as e:
            raise self._access_denied_error(user_id, str(e)) from e

    def _access_denied_error(self, user_id: ID, reason: str) -> Exception:
        return ProfileAccessDenied(
            reason,
            user_id=str(user_id),
            profile_name=self.profile_name,
        )

    def _not_set_error(self, user_id: ID) -> Exception:
        return ProfileNotSet(
            str(user_id),
            profile_name=self.profile_name,
        )

    def _operation_error(
        self,
        action: str,
        user_id: ID,
        details: str,
    ) -> Exception:
        return ProfileOperationError(
            action,
            str(user_id),
            profile_name=self.profile_name,
            details=details,
        )

    @abstractmethod
    async def _get_profile(self, user_id: ID) -> ProfileT | None:
        """Return the profile for a user, or None when it does not exist."""

    @abstractmethod
    async def _set_profile(self, user_id: ID) -> ProfileT:
        """Create or update the profile for a user."""
