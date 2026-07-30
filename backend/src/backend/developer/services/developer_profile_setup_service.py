import re

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.auth.model import DeveloperProfile
from backend.auth.services.user_manager import UserManager
from backend.core import logger
from backend.developer.exceptions import (
    DeveloperAccessDenied,
    DeveloperProfileError,
    DeveloperStoragePathError,
)
from backend.shared import ID
from backend.storage.services import Storage
from backend.utils import convert_uuid

from .developer_access_service import DeveloperAccessService


class DeveloperProfileSetupService:
    """Owns developer profile creation and storage path setup."""

    def __init__(
        self,
        session: Session,
        storage: Storage,
        user_manager: UserManager,
        access_service: DeveloperAccessService,
    ):
        self._session = session
        self._storage = storage
        self._user_manager = user_manager
        self._access_service = access_service

    async def set_developer_data(self, user_id: ID) -> DeveloperProfile:
        """Create or refresh the developer profile and its storage path."""
        try:
            await self._access_service.require_developer_access(user_id)
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
                self._session.add(dev_profile)
            else:
                logger.debug("Updating developer storage path for user %s", user_id)
                dev_profile.storage_path = storage_path
                self._session.add(dev_profile)

            self._storage.create_dir(storage_path)
            self._session.commit()
            self._session.refresh(dev_profile)
            return dev_profile
        except DeveloperAccessDenied:
            raise
        except SQLAlchemyError as e:
            self._session.rollback()
            logger.warning(
                "Database error setting developer profile for user %s",
                user_id,
            )
            raise DeveloperProfileError("set up", str(user_id), str(e)) from e
        except Exception as e:
            self._session.rollback()
            logger.warning(
                "Failed setting developer profile for user %s: %s",
                user_id,
                e,
            )
            raise DeveloperProfileError("set up", str(user_id), str(e)) from e

    async def generate_storage_path(self, user_id: ID) -> str:
        """Build the developer storage prefix from the user's institution and id."""
        user = await self._user_manager.get_user(user_id)
        if not user:
            raise DeveloperStoragePathError(
                "generate storage path",
                str(user_id),
                "User not found",
            )

        try:
            institution = await self._user_manager.get_user_inst(user_id)
        except Exception as e:
            raise DeveloperStoragePathError(
                "generate storage path",
                str(user_id),
                str(e),
            ) from e

        institution_name = (
            institution.name.value
            if institution and hasattr(institution.name, "value")
            else (institution.name if institution else "untitled_institution")
        )
        institution_slug = (
            re.sub(r"[^a-z0-9_-]+", "_", institution_name.lower()).strip("_")
            or "untitled_institution"
        )

        logger.debug("Generated developer storage path for user %s", user_id)
        return f"{institution_slug}/developers/{user.id}/"
