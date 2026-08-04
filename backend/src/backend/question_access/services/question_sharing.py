from backend.auth.exceptions import UserValidationError
from backend.auth.model import User
from backend.auth.services.user_manager import UserManager
from backend.developer.services import DeveloperProfileService
from backend.question_access.exceptions import QuestionAccessValidationError
from backend.question_access.model import AccessLevel, QuestionAccess
from backend.shared import ID

from .question_access import QuestionAccessService

RecipientRef = ID | str


class QuestionSharingService:
    def __init__(
        self,
        question_access: QuestionAccessService,
        developer_profiles: DeveloperProfileService,
        user_manager: UserManager,
    ) -> None:
        self._question_access = question_access
        self._developer_profiles = developer_profiles
        self._user_manager = user_manager

    async def share_question(
        self,
        owner_id: ID,
        recipient: RecipientRef,
        question_id: ID,
        level: AccessLevel,
    ) -> QuestionAccess:
        if level == AccessLevel.OWNER:
            raise QuestionAccessValidationError("Cannot share owner access level")

        recipient_user = await self._get_recipient_user(recipient)
        if recipient_user is None or recipient_user.id is None:
            raise QuestionAccessValidationError(
                f"Recipient user {recipient} does not exist"
            )

        await self._developer_profiles.get_or_create_profile(recipient_user.id)

        existing_access = await self._question_access.get_question_access(
            requester=recipient_user,
            question_id=question_id,
        )

        if existing_access and existing_access.access_level == AccessLevel.OWNER:
            raise QuestionAccessValidationError("Cannot change owner access level")

        if existing_access is None:
            return await self._question_access.grant_access(
                owner_id,
                recipient_user.id,
                question_id,
                level,
            )

        return await self._question_access.update_access(
            owner_id,
            recipient_user.id,
            question_id,
            level,
        )

    async def _get_recipient_user(self, recipient: RecipientRef) -> User | None:
        if isinstance(recipient, str) and "@" in recipient:
            return await self._user_manager.get_user_by_email(recipient)

        try:
            user = await self._user_manager.get_user(recipient)
        except UserValidationError:
            user = None

        if user is not None:
            return user

        if isinstance(recipient, str):
            return await self._user_manager.get_user_by_email(recipient)

        return None
