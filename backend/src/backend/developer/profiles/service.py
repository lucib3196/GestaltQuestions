import re

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.accounts.users import UserManager
from backend.authorization import RoleAccessPolicy
from backend.authorization.profiles.exceptions import ProfileAccessDenied, ProfileNotSet
from backend.authorization.profiles.service import ProfileService
from backend.authorization.roles import UserRoles
from backend.core import logger
from backend.developer.exceptions import DeveloperAccessDenied, DeveloperProfileNotSet
from backend.developer.model import DeveloperProfile
from backend.shared import ID
from backend.storage.services import Storage
from backend.utils import convert_uuid
from backend.accounts.model import Institution


def format_institution_slug(inst: Institution) -> str:
    institution_name = (
        inst.name.value
        if inst and hasattr(inst.name, "value")
        else (inst.name if inst else "untitled_institution")
    )
    institution_slug = (
        re.sub(r"[^a-z0-9_-]+", "_", institution_name.lower()).strip("_")
        or "untitled_institution"
    )
    return institution_slug


class DeveloperProfileService(ProfileService[DeveloperProfile]):
    """Owns developer profile lookup and setup."""

    profile_name = "Developer"

    def __init__(
        self,
        session: Session,
        storage: Storage,
        user_manager: UserManager,
    ) -> None:
        self._session = session
        self._storage = storage
        self._user_manager = user_manager
        policy = RoleAccessPolicy(
            self._user_manager,
            allowed_roles=[UserRoles.DEVELOPER],
            access_name="Developer",
        )
        super().__init__(policy)

    async def _get_profile(self, user_id: ID) -> DeveloperProfile | None:
        """Fetch the developer profile for a user."""
        try:
            logger.debug("Fetching developer profile for user %s", user_id)
            return self._session.exec(
                select(DeveloperProfile).where(
                    DeveloperProfile.user_id == convert_uuid(user_id)
                )
            ).first()
        except SQLAlchemyError as e:
            logger.warning("Failed fetching developer profile for user %s", user_id)
            raise self._operation_error("Retrieve", str(user_id), details=str(e)) from e

    async def _set_profile(self, user_id: ID) -> DeveloperProfile:
        """Create or refresh the developer profile and its storage path."""
        try:
            storage_path = await self.generate_storage_path(user_id)
            logger.debug("Setting developer profile for user %s", user_id)

            dev_profile = self._session.exec(
                select(DeveloperProfile).where(
                    DeveloperProfile.user_id == convert_uuid(user_id)
                )
            ).first()

            if dev_profile is None:
                logger.info("Creating developer profile for user %s", user_id)
                dev_profile = DeveloperProfile(
                    user_id=convert_uuid(user_id),
                    storage_path=storage_path,
                )

            self._storage.create_dir(storage_path)
            self._session.add(dev_profile)
            self._session.commit()
            self._session.refresh(dev_profile)
            return dev_profile
        except SQLAlchemyError as e:
            self._session.rollback()
            logger.warning(
                "Database error setting developer profile for user %s",
                user_id,
            )
            raise self._operation_error("set_up", str(user_id), str(e)) from e
        except Exception as e:
            self._session.rollback()
            logger.warning(
                "Failed setting developer profile for user %s: %s",
                user_id,
                e,
            )
            raise self._operation_error("set_up", str(user_id), str(e)) from e

    async def get_or_create_profile(self, user_id: ID) -> DeveloperProfile:
        try:
            profile = await self.get_profile(user_id)
        except (DeveloperProfileNotSet, ProfileNotSet):
            logger.info("Creating developer profile for user %s", user_id)
            profile = await self.set_profile(user_id)
        except ProfileAccessDenied as e:
            raise DeveloperAccessDenied(
                reason=str(e),
                user_id=str(user_id),
            ) from e

        if not profile.storage_path:
            logger.info(
                "Refreshing developer profile storage path for user %s",
                user_id,
            )
            profile = await self.set_profile(user_id)
        return profile

    async def generate_storage_path(self, user_id: ID) -> str:
        """Build the developer storage prefix from the user's institution and id."""
        user = await self._user_manager.get_user(user_id)
        if not user:
            raise self._operation_error(
                "generate storage path",
                str(user_id),
                "User not found",
            )

        institution = await self._user_manager.get_user_inst(user_id)
        if not institution:
            raise self._operation_error(
                "generate storage path", str(user_id), "User institution not defined"
            )

        institution_slug = format_institution_slug(institution)

        logger.debug("Generated developer storage path for user %s", user_id)
        return f"{institution_slug}/developers/{user.id}/"
