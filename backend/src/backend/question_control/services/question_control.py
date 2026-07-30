from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.core import logger
from backend.developer.exceptions import (
    DeveloperAccessDenied,
)
from backend.developer.services import (
    DeveloperProfileService,
)
from backend.question.models import Question
from backend.question_manager.exceptions import (
    DeveloperQuestionControlError,
)
from backend.question_manager.schemas import AccessDecision
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionControl:
    def __init__(
        self,
        session: Session,
        developer_profiles: DeveloperProfileService,
    ) -> None:
        self._session = session
        self._developer_profiles = developer_profiles

    async def has_question_control(self, user_id: ID, qid: ID) -> AccessDecision:
        """Return whether the developer profile has control over a question."""
        logger.debug(
            "Checking question control for user %s on question %s", user_id, qid
        )
        profile = await self._developer_profiles.get_developer_data(user_id)
        try:
            stmt = select(Question).where(
                Question.id == convert_uuid(qid),
                Question.created_by_id == convert_uuid(profile.id),
            )
            q = self._session.exec(stmt).first()
            if q is None:
                logger.warning(
                    "Question control denied for user %s on question %s", user_id, qid
                )
                return AccessDecision(
                    allowed=False,
                    reason="User does not have access to modify the question",
                )
            return AccessDecision(allowed=True, reason="User has control")
        except SQLAlchemyError as e:
            logger.warning(
                "Database error checking question control for user %s on question %s",
                user_id,
                qid,
            )
            raise DeveloperQuestionControlError(str(user_id), str(qid), str(e)) from e

    async def require_question_control(self, user_id: ID, qid: ID) -> None:
        """Raise when the user does not control the requested question."""
        access = await self.has_question_control(user_id, qid)
        if not access.allowed:
            raise DeveloperAccessDenied(
                access.reason, user_id=str(user_id), question_id=str(qid)
            )
