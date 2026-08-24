from collections.abc import Sequence
from typing import Literal

from backend.accounts import User
from backend.developer.collections.actions import DeveloperCollectionAction
from backend.developer.collections.authorizer import DeveloperCollectionAuthorizer
from backend.developer.model import DeveloperProfile
from backend.question import Question
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question.collections.schema import QuestionCollectionRead
from backend.question.collections.services.question_collection_service import (
    _UNSET,
    QuestionCollectionService,
    _UnsetType,
)
from backend.shared import ID


class DeveloperCollectionService:
    def __init__(
        self,
        collections: QuestionCollectionService[DeveloperProfile],
        authorizer: DeveloperCollectionAuthorizer,
    ) -> None:
        self._collections = collections
        self._authorizer = authorizer

    async def create_collection(
        self, user: User | ID, title: str
    ) -> QuestionCollection:
        owner = await self._authorizer.resolve_profile(user)
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
            await self._authorizer.resolve_profile(user),
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
            await self._authorizer.resolve_profile(user), collection_id
        )

    async def list_collections_from_owner(
        self,
        user: User | ID,
        offset: int | None = None,
        limit: int | None = 10,
        method: Literal["default", "detail-read"] = "detail-read",
    ) -> Sequence[QuestionCollection] | Sequence[QuestionCollectionRead]:
        return await self._collections.list_collections_by_owner(
            await self._authorizer.resolve_profile(user),
            offset=offset,
            limit=limit,
            method=method,
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
            await self._authorizer.resolve_profile(user),
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

    async def _require_action(
        self,
        user: User | ID | DeveloperProfile,
        collection: ID | QuestionCollection,
        action: DeveloperCollectionAction,
    ) -> None:
        await self._authorizer.require_action(user, collection, action)

    async def check_access(
        self,
        user: User | ID,
        collection_id: ID,
    ):
        return await self._authorizer.check_access(user, collection_id)
