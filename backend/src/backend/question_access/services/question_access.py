from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import AccessDecision, RoleAccessPolicy
from backend.developer.model import DeveloperProfile
from backend.question.models import Question
from backend.question_access.exceptions import (
    QuestionAccessControlError,
    QuestionAccessDenied,
    QuestionAccessValidationError,
)
from backend.question_access.model import AccessLevel, QuestionAccess
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionAccessService:
    """Manage shared access and access checks for questions."""

    _ACCESS_LEVEL_RANK = {
        AccessLevel.VIEW: 1,
        AccessLevel.EDIT: 2,
        AccessLevel.FULL: 3,
    }

    def __init__(self, session: Session, policy: RoleAccessPolicy) -> None:
        """Create the service with a database session and base role policy."""
        self._session = session
        self._policy = policy

    async def grant_access(
        self, owner_id: ID, requester: ID, question_id: ID, level: AccessLevel
    ) -> QuestionAccess:
        """Grant shared question access to a requester."""
        await self._validate(owner_id, requester, question_id)
        try:
            qaccess = QuestionAccess(
                question_id=convert_uuid(question_id),
                developer_id=convert_uuid(requester),
                access_level=level,
            )
            self._session.add(qaccess)
            self._session.commit()
            self._session.refresh(qaccess)
            return qaccess

        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionAccessValidationError(
                reason="Failed to create access",
                details=str(e),
            ) from e

    async def update_access(
        self, owner_id: ID, requester: ID, question_id: ID, level: AccessLevel
    ) -> QuestionAccess:
        """Update an existing shared question access level."""
        await self._validate(owner_id, requester, question_id)

        try:
            qaccess = await self._get_question_access(requester, question_id)
            if qaccess is None:
                raise QuestionAccessValidationError(
                    reason=(
                        f"Question access for requester {requester} "
                        f"on question {question_id} does not exist"
                    )
                )

            qaccess.access_level = level
            qaccess.updated_at = datetime.now()

            self._session.add(qaccess)
            self._session.commit()
            self._session.refresh(qaccess)
            return qaccess

        except QuestionAccessValidationError:
            raise
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionAccessValidationError(
                reason="Failed to update access",
                details=str(e),
            ) from e

    async def revoke_access(
        self, owner_id: ID, requester: ID, question_id: ID
    ) -> QuestionAccess:
        """Remove an existing shared question access record."""
        await self._validate(owner_id, requester, question_id)

        try:
            qaccess = await self._get_question_access(requester, question_id)
            if qaccess is None:
                raise QuestionAccessValidationError(
                    reason=(
                        f"Question access for requester {requester} "
                        f"on question {question_id} does not exist"
                    )
                )

            self._session.delete(qaccess)
            self._session.commit()
            return qaccess

        except QuestionAccessValidationError:
            raise
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionAccessValidationError(
                reason="Failed to revoke access",
                details=str(e),
            ) from e

    async def can_view_question(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user can view the question."""
        return await self._can_access_question(user_id, question_id, AccessLevel.VIEW)

    async def can_edit_question(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user can edit the question."""
        return await self._can_access_question(user_id, question_id, AccessLevel.EDIT)

    async def can_delete_question(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user can delete the question."""
        return await self._can_access_question(user_id, question_id, AccessLevel.FULL)

    async def require_question_view_access(self, user_id: ID, question_id: ID) -> None:
        """Raise when the user cannot view the question."""
        await self._require_question_access(user_id, question_id, AccessLevel.VIEW)

    async def require_question_edit_access(self, user_id: ID, question_id: ID) -> None:
        """Raise when the user cannot edit the question."""
        await self._require_question_access(user_id, question_id, AccessLevel.EDIT)

    async def require_question_delete_access(
        self, user_id: ID, question_id: ID
    ) -> None:
        """Raise when the user cannot delete the question."""
        await self._require_question_access(user_id, question_id, AccessLevel.FULL)

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
            raise QuestionAccessControlError(
                str(user_id), str(question_id), str(e)
            ) from e

    async def _can_access_question(
        self,
        user_id: ID,
        question_id: ID,
        minimum_level: AccessLevel,
    ) -> AccessDecision:
        """Evaluate base policy, ownership, and shared access for a question."""
        base_access = await self._policy.evaluate(user_id)
        if not base_access.allowed:
            return base_access

        owner = await self.is_question_owner(user_id, question_id)
        if owner.allowed:
            return AccessDecision(True, "Question owner has full access")

        return await self._has_access(
            user_id,
            question_id,
            minimum_level,
        )

    async def _require_question_access(
        self, user_id: ID, question_id: ID, minimum_level: AccessLevel
    ) -> None:
        """Raise when the user does not meet the required question access level."""
        access = await self._can_access_question(user_id, question_id, minimum_level)
        if not access.allowed:
            raise QuestionAccessDenied(
                access.reason,
                user_id=str(user_id),
                question_id=str(question_id),
            )

    async def _has_access(
        self,
        requester_id: ID,
        question_id: ID,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision:
        """Return whether shared access meets the requested minimum level."""
        access = await self._get_question_access(requester_id, question_id)
        if not access:
            return AccessDecision(False, "Question access does not exist")

        has_level = (
            self._ACCESS_LEVEL_RANK[access.access_level]
            >= self._ACCESS_LEVEL_RANK[minimum_level]
        )
        if not has_level:
            return AccessDecision(
                False,
                (
                    f"Question access level {access.access_level} "
                    f"is below required level {minimum_level}"
                ),
            )

        return AccessDecision(True, "Question access granted")

    async def _validate(self, owner_id: ID, requester_id: ID, question_id: ID) -> None:
        """Validate question existence, owner authority, and requester base policy."""
        q = await self._get_question(question_id)
        if not q:
            raise QuestionAccessValidationError(
                reason=f"Question with {question_id} does not exist"
            )

        owner_eval = await self._policy.evaluate(owner_id)
        if not owner_eval.allowed:
            raise QuestionAccessValidationError(
                "Owner does not have valid permission",
                owner_eval.reason,
            )
        owner_access = await self.is_question_owner(owner_id, question_id)
        if not owner_access.allowed:
            raise QuestionAccessDenied(
                owner_access.reason,
                user_id=str(owner_id),
                question_id=str(question_id),
            )
        requester_eval = await self._policy.evaluate(requester_id)
        if not requester_eval.allowed:
            raise QuestionAccessValidationError(
                "Requester does not have valid permission",
                requester_eval.reason,
            )

    async def _get_question(self, question_id: ID) -> Question | None:
        """Return the question by id, or None when it does not exist."""
        return self._session.get(Question, convert_uuid(question_id))

    async def _get_question_access(
        self, requester_id: ID, question_id: ID
    ) -> QuestionAccess | None:
        """Return shared access for a requester and question, if one exists."""
        stmt = select(QuestionAccess).where(
            QuestionAccess.question_id == convert_uuid(question_id),
            QuestionAccess.developer_id == convert_uuid(requester_id),
        )
        return self._session.exec(stmt).first()
