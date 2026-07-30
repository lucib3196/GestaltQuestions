from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import AccessDecision, RoleAccessPolicy
from backend.developer.exceptions import (
    DeveloperAccessDenied,
)
from backend.developer.model import DeveloperProfile
from backend.question.models import Question
from backend.question_manager.exceptions import (
    DeveloperQuestionControlError,
)
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionAccessService:
    def __init__(self, session: Session, policy: RoleAccessPolicy) -> None:
        self._session = session
        self._policy = policy

    async def can_view_question(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user can view the question."""
        base_access = await self._policy.evaluate(user_id)
        if not base_access.allowed:
            return base_access

        owner = await self.is_question_owner(user_id, question_id)
        if owner.allowed:
            return AccessDecision(True, "Question owner has full access")
        return await self.has_shared_question_access(user_id, question_id)

    async def require_question_view_access(self, user_id: ID, question_id: ID) -> None:
        """Raise when the user cannot view the question."""
        access = await self.can_view_question(user_id, question_id)
        if not access.allowed:
            raise DeveloperAccessDenied(
                access.reason,
                user_id=str(user_id),
                question_id=str(question_id),
            )

    async def can_edit_question(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user can edit the question."""
        base_access = await self._policy.evaluate(user_id)
        if not base_access.allowed:
            return base_access

        owner = await self.is_question_owner(user_id, question_id)
        if owner.allowed:
            return AccessDecision(True, "Question owner has full access")
        return await self.has_shared_question_access(user_id, question_id)

    async def require_question_edit_access(self, user_id: ID, question_id: ID) -> None:
        """Raise when the user cannot edit the question."""

        access = await self.can_edit_question(user_id, question_id)
        if not access.allowed:
            raise DeveloperAccessDenied(
                access.reason,
                user_id=str(user_id),
                question_id=str(question_id),
            )

    async def can_delete_question(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user can delete the question."""
        base_access = await self._policy.evaluate(user_id)
        if not base_access.allowed:
            return base_access

        owner = await self.is_question_owner(user_id, question_id)
        if owner.allowed:
            return AccessDecision(True, "Question owner has full access")

        return AccessDecision(False, "Only the question owner can delete this question")

    async def require_question_delete_access(
        self, user_id: ID, question_id: ID
    ) -> None:
        """Raise when the user cannot delete the question."""
        access = await self.can_delete_question(user_id, question_id)
        if not access.allowed:
            raise DeveloperAccessDenied(
                access.reason,
                user_id=str(user_id),
                question_id=str(question_id),
            )

    # Wraps the above to access decisions such that we verify wether its okay

    async def is_question_owner(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user owns the question."""
        try:
            stmt = (
                select(Question)
                .join(DeveloperProfile)
                .where(
                    Question.id == convert_uuid(question_id),
                    DeveloperProfile.user_id == convert_uuid(user_id),
                    Question.created_by_id == DeveloperProfile.id,
                )
            )
            question = self._session.exec(stmt).first()
            if question is None:
                return AccessDecision(False, "User is not the question owner")
            return AccessDecision(True, "User is the question owner")
        except SQLAlchemyError as e:
            raise DeveloperQuestionControlError(
                str(user_id), str(question_id), str(e)
            ) from e

    async def has_shared_question_access(
        self,
        user_id: ID,
        question_id: ID,
    ) -> AccessDecision:

        # Placeholder until a QuestionShare / permission table exists.
        return AccessDecision(False, "Question is not shared with this user")
