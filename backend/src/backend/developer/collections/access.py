from collections.abc import Sequence

from sqlalchemy import case
from sqlmodel import Session, col, select

from backend.authorization import AccessLevel, AccessPolicyError
from backend.authorization.resources import (
    ResourceAccessOperationError,
    ResourceAccessService,
)
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.question import Question
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionAccess,
    QuestionCollectionLink,
)
from backend.question.collections.services.question_collection_access_adapter import (
    DetailRead,
    QuestionCollectionAdapter,
)
from backend.shared import ID


class QuestionCollectionAccessService(
    ResourceAccessService[
        QuestionCollectionAccess, DeveloperProfile, QuestionCollection, DetailRead
    ]
):
    def __init__(
        self,
        adapter: QuestionCollectionAdapter,
        profile_service: DeveloperProfileService,
    ) -> None:
        super().__init__(adapter=adapter, profile_service=profile_service)
        self._collection_adapter = adapter

    async def list_access_shared_by(
        self, requester: DeveloperProfile | ID
    ) -> Sequence[DetailRead]:
        requester_profile = await self._resolve_profile(requester)
        try:
            return await self._collection_adapter.list_access_granted_by(
                requester_profile
            )
        except AccessPolicyError:
            raise
        except Exception as e:
            raise ResourceAccessOperationError(
                "list",
                resource_name="Collection",
                profile_id=str(requester_profile.id),
                details=str(e),
            ) from e


class QuestionCollectionAccessReader:
    def __init__(self, session: Session) -> None:
        self._session = session
        access_level = col(QuestionCollectionAccess.access_level)
        self._access_level_order = case(
            (access_level == AccessLevel.VIEW, 1),
            (access_level == AccessLevel.EDIT, 2),
            (access_level == AccessLevel.FULL, 3),
            (access_level == AccessLevel.OWNER, 4),
            else_=0,
        )

    def get_access_for_question_in_collection(
        self,
        question: Question,
        developer: DeveloperProfile,
    ) -> QuestionCollectionAccess | None:
        statement = (
            select(QuestionCollectionAccess)
            .join(
                QuestionCollectionLink,
                col(QuestionCollectionLink.collection_id)
                == col(QuestionCollectionAccess.collection_id),
            )
            .where(
                QuestionCollectionLink.question_id == question.id,
                QuestionCollectionAccess.developer_id == developer.id,
            )
            .order_by(self._access_level_order.desc())
        )

        return self._session.exec(statement).first()
