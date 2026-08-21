from backend.accounts import User
from backend.developer.collections.access import QuestionCollectionAccessService
from backend.developer.collections.actions import (
    DeveloperCollectionAction,
    DeveloperCollectionPolicy,
)
from backend.developer.exceptions import DeveloperAccessDenied
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.question import Question
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question.collections.schema import QuestionCollectionRead
from typing import Literal
from backend.question.collections.services.question_collection_service import (
    _UNSET,
    QuestionCollectionService,
    _UnsetType,
)
from backend.shared import ID

from typing import Sequence


class DeveloperCollectionService:
    def __init__(
        self,
        profile_service: DeveloperProfileService,
        collections: QuestionCollectionService[DeveloperProfile],
        collection_access: QuestionCollectionAccessService,
    ) -> None:
        self._profile_service = profile_service
        self._collections = collections
        self._access = collection_access
        self._policy = DeveloperCollectionPolicy()

    async def create_collection(
        self, user: User | ID, title: str
    ) -> QuestionCollection:
        owner = await self._resolve_profile(user)
        return await self._collections.create_collection(owner, title)

    async def get_collection(
        self, user: User | ID, collection_id: ID
    ) -> QuestionCollection:
        await self._require_action(user, collection_id, DeveloperCollectionAction.VIEW)
        return self._collections.get_collection(collection_id)

    async def update_collection(
        self,
        user: User | ID,
        collection_id: ID,
        title: str | None,
        parent_id: ID | None | _UnsetType = _UNSET,
    ) -> QuestionCollection:
        await self._require_action(
            user, collection_id, DeveloperCollectionAction.UPDATE
        )

        parent = _UNSET
        if not isinstance(parent_id, _UnsetType):
            if parent_id is None:
                parent = None
            else:
                await self._require_action(
                    user, parent_id, DeveloperCollectionAction.CREATE_CHILD
                )
                parent = await self.get_collection(user, parent_id)

        return await self._collections.update_collection(
            await self._resolve_profile(user),
            collection_id,
            title,
            parent,
        )

    async def add_question(
        self, user: User | ID, collection_id: ID, question: Question | ID
    ) -> QuestionCollectionLink:
        await self._require_action(
            user, collection_id, DeveloperCollectionAction.ADD_QUESTION
        )
        return await self._collections.add_question(collection_id, question)

    async def remove_question(
        self, user: User | ID, collection_id: ID, question: Question | ID
    ):
        await self._require_action(
            user, collection_id, DeveloperCollectionAction.REMOVE_QUESTION
        )
        return await self._collections.remove_question(collection_id, question)

    async def delete_collection(self, user: User | ID, collection_id: ID) -> bool:
        await self._require_action(
            user, collection_id, DeveloperCollectionAction.DELETE
        )
        return await self._collections.delete_collection(
            await self._resolve_profile(user), collection_id
        )

    async def list_collections_from_owner(
        self,
        user: User | ID,
        offset: int | None = None,
        limit: int | None = 10,
        method: Literal["default","detail-read"] = "detail-read"
    ) -> Sequence[QuestionCollection]|Sequence[QuestionCollectionRead]:
        return await self._collections.list_collections_by_owner(
            await self._resolve_profile(user), offset=offset, limit=limit, method=method
        )

    async def search_collections(
        self,
        user: User | DeveloperProfile | ID,
        collection_id: ID | None = None,
        title: str | None = None,
        offset: int | None = None,
        limit: int | None = 10,
    ):
        return await self._collections.search_collections_from_owner(
            await self._resolve_profile(user),
            collection_id=collection_id,
            title=title,
            offset=offset,
            limit=limit,
            method="detail-read",
        )

    async def get_questions_in_collection(
        self, user: User | DeveloperProfile | ID, collection: QuestionCollection | ID
    ) -> Sequence[Question]:
        await self._require_action(user, collection, DeveloperCollectionAction.VIEW)
        return self._collections.get_questions_in_collection(
            self._collections.get_collection(collection)
        )

    async def _resolve_profile(
        self, user: User | DeveloperProfile | ID
    ) -> DeveloperProfile:
        if isinstance(user, DeveloperProfile):
            return user
        return await self._profile_service.get_profile(self._resolve_user_id(user))

    async def _require_action(
        self,
        user: User | ID | DeveloperProfile,
        collection: ID | QuestionCollection,
        action: DeveloperCollectionAction,
    ) -> None:
        user_id = self._resolve_user_id(user)
        required_level = self._policy.required_level(action)
        decision = await self._access.has_access(user_id, collection, required_level)
        if not decision.allowed:
            raise DeveloperAccessDenied(
                reason=decision.reason,
                user_id=str(user_id),
                resource_id=str(collection),
            )

    async def check_access(
        self,
        user: User | ID,
        collection_id: ID,
    ):
        return await self._access.check_access(
            self._resolve_user_id(user), collection_id
        )

    @staticmethod
    def _resolve_user_id(user: User | DeveloperProfile | ID) -> ID:
        if isinstance(user, User | DeveloperProfile):
            return user.id
        return user
