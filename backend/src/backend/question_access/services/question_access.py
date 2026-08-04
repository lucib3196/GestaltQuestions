from datetime import datetime
from typing import overload
from uuid import UUID

from multimethod import multimethod
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import AccessDecision, RoleAccessPolicy
from backend.auth.model import User
from backend.developer.model import DeveloperProfile
from backend.question.models import Question
from backend.question.schema import Status
from backend.question_access.exceptions import (
    QuestionAccessControlError,
    QuestionAccessDenied,
    QuestionAccessValidationError,
)
from backend.question_access.model import AccessLevel, QuestionAccess
from backend.shared import ID
from backend.utils import convert_uuid

type UserRef = User | str | UUID | ID


class QuestionAccessService:
    """Manage shared access and access checks for questions."""

    _ACCESS_LEVEL_RANK = {
        AccessLevel.VIEW: 1,
        AccessLevel.EDIT: 2,
        AccessLevel.FULL: 3,
        AccessLevel.OWNER: 4,
    }

    def __init__(self, session: Session, policy: RoleAccessPolicy) -> None:
        """Create the service with a database session and base role policy."""
        self._session = session
        # Defines which roles have access
        self._policy = policy

    @multimethod
    async def get_question_access(  # type: ignore
        self, requester: User, question_id: str | UUID
    ) -> QuestionAccess | None:
        """Return shared access for a requester user and question, if one exists."""
        return await self._get_question_access_by_user_id(requester.id, question_id)

    @multimethod  # type: ignore[reportRedeclaration]
    async def get_question_access(
        self, requester_id: str | UUID, question_id: str | UUID
    ) -> QuestionAccess | None:
        """Return shared access for a requester id and question, if one exists."""
        return await self._get_question_access_by_user_id(requester_id, question_id)

    async def can_access_question(
        self,
        user_id: ID,
        question_id: ID,
        minimum_level: AccessLevel = AccessLevel.VIEW,
    ) -> AccessDecision:
        """Evaluate base policy, ownership, and shared access for a question."""
        base_access = await self._policy.evaluate(user_id)
        if not base_access.allowed:
            return base_access

        owner = await self.is_question_owner(user_id, question_id)
        if owner.allowed:
            return AccessDecision(True, "Question owner has full access")

        if minimum_level == AccessLevel.VIEW:
            published = await self._is_question_published(question_id)
            if published.allowed:
                return AccessDecision(
                    True, "Published question grants public view access"
                )

        return await self._has_access(
            user_id,
            question_id,
            minimum_level,
        )

    async def grant_access(
        self, owner: UserRef, requester: UserRef, question_id: ID, level: AccessLevel
    ) -> QuestionAccess:
        """Grant shared question access to a requester."""
        owner_id = self._user_ref_id(owner)
        requester_id = self._user_ref_id(requester)

        await self._validate(owner_id, requester_id, question_id)

        requester_profile = await self._get_developer_profile(requester_id)
        if requester_profile is None:
            raise QuestionAccessValidationError(
                reason=f"Requester developer profile for {requester_id} does not exist"
            )

        try:
            qaccess = QuestionAccess(
                question_id=convert_uuid(question_id),
                developer_id=requester_profile.id,
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

    @overload
    async def update_access(
        self, owner: User, requester: User, question_id: ID, level: AccessLevel
    ) -> QuestionAccess: ...

    @overload
    async def update_access(
        self, owner: UserRef, requester: UserRef, question_id: ID, level: AccessLevel
    ) -> QuestionAccess: ...

    async def update_access(
        self, owner: UserRef, requester: UserRef, question_id: ID, level: AccessLevel
    ) -> QuestionAccess:
        """Update an existing shared question access level."""
        owner_id = self._user_ref_id(owner)
        requester_id = self._user_ref_id(requester)

        await self._validate(owner_id, requester_id, question_id)

        try:
            qaccess = await self.get_question_access(requester_id, question_id)
            if qaccess is None:
                raise QuestionAccessValidationError(
                    reason=(
                        f"Question access for requester {requester_id} "
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
            qaccess = await self.get_question_access(requester, question_id)
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

    async def is_question_owner(self, user_id: ID, question_id: ID) -> AccessDecision:
        """Return whether the user owns the question."""
        try:
            question = await self._get_owned_question(user_id, question_id)
            if question is None:
                return AccessDecision(False, "User is not the question owner")
            await self._get_owner_question_access(user_id, question_id)
            return AccessDecision(True, "User is the question owner")
        except SQLAlchemyError as e:
            raise QuestionAccessControlError(
                str(user_id), str(question_id), str(e)
            ) from e

    # Exception Raiser
    async def require_question_access(
        self, user_id: ID, question_id: ID, minimum_level: AccessLevel
    ) -> None:
        """Raise when the user does not meet the required question access level."""
        access = await self.can_access_question(user_id, question_id, minimum_level)
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
        access = await self.get_question_access(requester_id, question_id)
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

    # Helpers for validation and retrieval

    async def _get_question_access_by_user_id(
        self,
        requester_id: ID,
        question_id: ID,
    ) -> QuestionAccess | None:
        owner_access = await self._get_owner_question_access(requester_id, question_id)
        if owner_access is not None:
            return owner_access

        stmt = (
            select(QuestionAccess)
            .join(
                DeveloperProfile,
                DeveloperProfile.id == QuestionAccess.developer_id,  # type: ignore
            )
            .where(
                QuestionAccess.question_id == convert_uuid(question_id),
                DeveloperProfile.user_id == convert_uuid(requester_id),
            )
        )
        return self._session.exec(stmt).first()

    async def _get_owner_question_access(
        self,
        requester_id: ID,
        question_id: ID,
    ) -> QuestionAccess | None:
        try:
            question = await self._get_owned_question(requester_id, question_id)
            if question is None or question.created_by_id is None:
                return None

            stmt = select(QuestionAccess).where(
                QuestionAccess.question_id == convert_uuid(question_id),
                QuestionAccess.developer_id == question.created_by_id,
            )
            owner_access = self._session.exec(stmt).first()
            if owner_access is None:
                owner_access = QuestionAccess(
                    question_id=convert_uuid(question_id),
                    developer_id=question.created_by_id,
                    access_level=AccessLevel.OWNER,
                    created_at=question.created_at or datetime.now(),
                    updated_at=(
                        question.updated_at or question.created_at or datetime.now()
                    ),
                )
                self._session.add(owner_access)
                self._session.commit()
                self._session.refresh(owner_access)
                return owner_access

            if owner_access.access_level != AccessLevel.OWNER:
                owner_access.access_level = AccessLevel.OWNER
                owner_access.updated_at = datetime.now()
                self._session.add(owner_access)
                self._session.commit()
                self._session.refresh(owner_access)

            return owner_access
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionAccessControlError(
                str(requester_id), str(question_id), str(e)
            ) from e

    async def _get_owned_question(
        self,
        requester_id: ID,
        question_id: ID,
    ) -> Question | None:
        stmt = (
            select(Question)
            .join(DeveloperProfile)
            .where(
                Question.id == convert_uuid(question_id),
                DeveloperProfile.user_id == convert_uuid(requester_id),
                Question.created_by_id == DeveloperProfile.id,
            )
        )
        return self._session.exec(stmt).first()

    async def _get_developer_profile(self, user_id: ID) -> DeveloperProfile | None:
        stmt = select(DeveloperProfile).where(
            DeveloperProfile.user_id == convert_uuid(user_id)
        )
        return self._session.exec(stmt).first()

    def _user_ref_id(self, user: UserRef) -> ID:
        if isinstance(user, User):
            return user.id
        return user

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

    async def _is_question_published(self, question_id: ID) -> AccessDecision:
        try:
            question = self._session.get(Question, convert_uuid(question_id))
            if question is None:
                return AccessDecision(False, "Question does not exist")

            if question.status == Status.PUBLISHED:
                return AccessDecision(True, "Question is published")

            return AccessDecision(False, "Question is not published")
        except SQLAlchemyError as e:
            raise QuestionAccessControlError(
                "published", str(question_id), str(e)
            ) from e
