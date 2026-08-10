import asyncio
from collections.abc import Sequence
from uuid import UUID

from backend.developer.access import QuestionCollectionAccessService
from backend.developer.actions import (
    DeveloperCollectionAction,
    DeveloperCollectionPolicy,
)
from backend.developer.exceptions import DeveloperAccessDenied
from backend.developer.model import DeveloperProfile
from backend.developer.services.developer_profile_service import DeveloperProfileService
from backend.question import Question
from backend.question_collections.exceptions import QuestionCollectionNotFoundError
from backend.question_collections.model import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question_collections.schema import QuestionCollectionRead
from backend.question_collections.service.question_collection_service import (
    QuestionCollectionService,
)
from backend.shared import ID


class DeveloperCollectionService:
    """Gate developer collection actions and coordinate collection persistence."""

    def __init__(
        self,
        developer_profiles: DeveloperProfileService,
        collections: QuestionCollectionService[DeveloperProfile],
        collection_access: QuestionCollectionAccessService,
    ) -> None:
        self._developer_profiles = developer_profiles
        self._collections = collections
        self._collection_access = collection_access
        self._policy = DeveloperCollectionPolicy()

    async def create_collection(
        self,
        user_id: ID,
        title: str,
        parent_id: ID | None = None,
    ) -> QuestionCollection:
        owner = await self._developer_profiles.get_profile(user_id)
        parent = None

        if parent_id is not None:
            await self._require_action(
                user_id,
                parent_id,
                DeveloperCollectionAction.CREATE_CHILD,
            )
            parent = self._require_collection(parent_id)

        return await self._collections.create_collection(owner, title, parent)

    async def search_collections(
        self,
        user_id: ID,
        *,
        collection_id: ID | None = None,
        title: str | None = None,
        offset: int | None = None,
        limit: int | None = 10,
    ) -> Sequence[QuestionCollectionRead]:
        owner = await self._developer_profiles.get_profile(user_id)
        collections = await self._collections.search_collections(
            owner, collection_id=collection_id, title=title, offset=offset, limit=limit
        )
        collection_reads = await asyncio.gather(
            *(self._collections.get_collection_read(c.id) for c in collections if c.id)
        )
        


        return [collection for collection in collection_reads if collection is not None]

    async def get_collection(
        self,
        user_id: ID,
        collection_id: ID,
    ) -> QuestionCollection:
        await self._require_action(
            user_id,
            collection_id,
            DeveloperCollectionAction.VIEW,
        )
        return self._require_collection(collection_id)

    async def update_collection(
        self,
        user_id: ID,
        collection_id: ID,
        title: str | None = None,
        parent_id: ID | None = None,
    ) -> QuestionCollection:
        await self._require_action(
            user_id,
            collection_id,
            DeveloperCollectionAction.UPDATE,
        )

        owner = await self._developer_profiles.get_profile(user_id)
        parent = None

        if parent_id is not None:
            await self._require_action(
                user_id,
                parent_id,
                DeveloperCollectionAction.CREATE_CHILD,
            )
            parent = self._require_collection(parent_id)

        return await self._collections.update_collection(
            owner,
            collection_id,
            title=title,
            parent=parent,
        )

    async def delete_collection(self, user_id: ID, collection_id: ID) -> bool:
        await self._require_action(
            user_id,
            collection_id,
            DeveloperCollectionAction.DELETE,
        )
        owner = await self._developer_profiles.get_profile(user_id)
        return await self._collections.delete_collection(owner, collection_id)

    async def add_question(
        self,
        user_id: ID,
        collection_id: ID,
        question_id: ID,
    ) -> QuestionCollectionLink:
        await self._require_action(
            user_id,
            collection_id,
            DeveloperCollectionAction.ADD_QUESTION,
        )
        return await self._collections.add_question(collection_id, question_id)

    async def remove_question(
        self,
        user_id: ID,
        collection_id: ID,
        question_id: ID,
    ) -> bool:
        await self._require_action(
            user_id,
            collection_id,
            DeveloperCollectionAction.REMOVE_QUESTION,
        )
        return await self._collections.remove_question(collection_id, question_id)

    async def list_collections(
        self,
        user_id: ID,
        offset: int | None = None,
        limit: int | None = 100,
    ) -> Sequence[QuestionCollection]:
        return self._collections.list_collections_by_owner(
            await self._developer_profiles.get_profile(user_id), offset, limit
        )

    async def get_owner_profile_id(self, user_id: ID) -> UUID:
        owner = await self._developer_profiles.get_profile(user_id)
        if owner.id is None:
            raise DeveloperAccessDenied(
                "Developer profile must be persisted",
                user_id=str(user_id),
            )
        return owner.id

    async def get_all_questions(
        self, user_id: ID, collection_id: ID
    ) -> Sequence[Question]:
        await self._require_action(
            user_id,
            collection_id,
            DeveloperCollectionAction.VIEW,
        )
        return await self._collections.get_all_questions(collection_id)

    async def _require_action(
        self,
        user_id: ID,
        collection_id: ID,
        action: DeveloperCollectionAction,
    ) -> None:
        required_level = self._policy.required_level(action)
        decision = await self._collection_access.has_access_by_id(
            user_id,
            collection_id,
            required_level,
        )
        if not decision.allowed:
            raise DeveloperAccessDenied(
                decision.reason,
                user_id=str(user_id),
                question_id=str(collection_id),
            )

    def _require_collection(self, collection_id: ID) -> QuestionCollection:
        collection = self._collections.get_collection(collection_id)
        if collection is None:
            raise QuestionCollectionNotFoundError(str(collection_id))
        return collection
