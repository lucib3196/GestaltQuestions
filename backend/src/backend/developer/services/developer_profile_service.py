from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.auth.model import DeveloperProfile
from backend.core import logger
from backend.developer.exceptions import (
    DeveloperProfileError,
    DeveloperProfileNotSet,
)
from backend.shared import ID
from backend.utils import convert_uuid

from .developer_access_service import DeveloperAccessService


class DeveloperProfileService:
    """Owns developer profile lookup."""

    def __init__(self, session: Session, access_service: DeveloperAccessService):
        self._session = session
        self._access_service = access_service

    async def get_developer_data(self, user_id: ID) -> DeveloperProfile:
        """Fetch the developer profile for a user after validating access."""
        await self._access_service.require_developer_access(user_id)
        try:
            logger.debug("Fetching developer profile for user %s", user_id)
            profile = self._session.exec(
                select(DeveloperProfile).where(
                    DeveloperProfile.user_id == convert_uuid(user_id)
                )
            ).first()
            if not profile:
                raise DeveloperProfileNotSet(
                    action="retrieve_developer_data",
                    user_id=str(user_id),
                    details=f"Developer {user_id} profile not complete must be set",
                )
            return profile
        except DeveloperProfileNotSet:
            raise
        except SQLAlchemyError as e:
            logger.warning("Failed fetching developer profile for user %s", user_id)
            raise DeveloperProfileError("retrieve", str(user_id), str(e)) from e
