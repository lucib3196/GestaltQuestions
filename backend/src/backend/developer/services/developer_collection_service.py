from backend.auth import User
from backend.developer.access import QuestionCollectionAccessService
from backend.developer.actions import (
    DeveloperCollectionAction,
    DeveloperCollectionPolicy,
)
from backend.developer.exceptions import DeveloperAccessDenied
from backend.developer.model import DeveloperProfile
from backend.developer.services.developer_profile_service import DeveloperProfileService
from backend.question import Question
from backend.question_collections.model import (
    QuestionCollection,
    QuestionCollectionLink,
)
from backend.question_collections.service.question_collection_service import (
    QuestionCollectionService,
    _UNSET,
    _UnsetType,
)
from backend.shared import ID


class DeveloperCollectionService:
    def __init__(
        self,
        profile_service: DeveloperProfileService,
        collections: QuestionCollectionService[DeveloperProfile],
        collection_access: QuestionCollectionAccessService,
    ):
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

    async def _resolve_profile(self, user: User | ID) -> DeveloperProfile:
        return await self._profile_service.get_profile(self._resolve_user_id(user))

    async def _require_action(
        self, user: User | ID, collection_id: ID, action: DeveloperCollectionAction
    ):
        user_id = self._resolve_user_id(user)
        required_level = self._policy.required_level(action)
        decision = await self._access.has_access(user_id, collection_id, required_level)
        if not decision.allowed:
            raise DeveloperAccessDenied(
                reason=decision.reason,
                user_id=str(user_id),
                resource_id=str(collection_id),
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
    def _resolve_user_id(user: User | ID) -> ID:
        if isinstance(user, User):
            return user.id
        return user


# class DeveloperCollectionService:
#     """Gate developer collection actions and coordinate collection persistence."""

#     def __init__(
#         self,
#         developer_profiles: DeveloperProfileService,
#         collections: QuestionCollectionService[DeveloperProfile],
#         collection_access: QuestionCollectionAccessService,
#     ) -> None:
#         self._developer_profiles = developer_profiles
#         self._collections = collections
#         self._collection_access = collection_access
#         self._policy = DeveloperCollectionPolicy()


#     async def search_collections(
#         self,
#         user_id: ID,
#         *,
#         collection_id: ID | None = None,
#         title: str | None = None,
#         offset: int | None = None,
#         limit: int | None = 10,
#     ) -> Sequence[QuestionCollectionRead]:
#         owner = await self._developer_profiles.get_profile(user_id)
#         collections = await self._collections.search_collections(
#             owner, collection_id=collection_id, title=title, offset=offset, limit=limit
#         )
#         collection_reads = await asyncio.gather(
#             *(
#                 self._collections.get_collection_detail_read(c.id)
#                 for c in collections
#                 if c.id
#             )
#         )
#         return [collection for collection in collection_reads if collection is not None]

#     async def get_collection(
#         self,
#         user_id: ID,
#         collection_id: ID,
#     ) -> QuestionCollection:
#         await self._require_action(
#             user_id,
#             collection_id,
#             DeveloperCollectionAction.VIEW,
#         )
#         return self._require_collection(collection_id)

#     async def update_collection(
#         self,
#         user_id: ID,
#         collection_id: ID,
#         title: str | None = None,
#         parent_id: ID | None = None,
#     ) -> QuestionCollection:
#         await self._require_action(
#             user_id,
#             collection_id,
#             DeveloperCollectionAction.UPDATE,
#         )

#         owner = await self._developer_profiles.get_profile(user_id)
#         parent = None

#         if parent_id is not None:
#             await self._require_action(
#                 user_id,
#                 parent_id,
#                 DeveloperCollectionAction.CREATE_CHILD,
#             )
#             parent = self._require_collection(parent_id)

#         return await self._collections.update_collection(
#             owner,
#             collection_id,
#             title=title,
#             parent=parent,
#         )

#     async def delete_collection(self, user_id: ID, collection_id: ID) -> bool:
#         await self._require_action(
#             user_id,
#             collection_id,
#             DeveloperCollectionAction.DELETE,
#         )
#         owner = await self._developer_profiles.get_profile(user_id)
#         return await self._collections.delete_collection(owner, collection_id)

#     async def add_question(
#         self,
#         user_id: ID,
#         collection_id: ID,
#         question_id: ID,
#     ) -> QuestionCollectionLink:
#         await self._require_action(
#             user_id,
#             collection_id,
#             DeveloperCollectionAction.ADD_QUESTION,
#         )
#         return await self._collections.add_question(collection_id, question_id)

#     async def remove_question(
#         self,
#         user_id: ID,
#         collection_id: ID,
#         question_id: ID,
#     ) -> bool:
#         await self._require_action(
#             user_id,
#             collection_id,
#             DeveloperCollectionAction.REMOVE_QUESTION,
#         )
#         return await self._collections.remove_question(collection_id, question_id)

#     async def list_collections(
#         self,
#         user_id: ID,
#         offset: int | None = None,
#         limit: int | None = 100,
#     ) -> Sequence[QuestionCollection]:
#         return self._collections.list_collections_by_owner(
#             await self._developer_profiles.get_profile(user_id), offset, limit
#         )

#     async def get_owner_profile_id(self, user_id: ID) -> UUID:
#         owner = await self._developer_profiles.get_profile(user_id)
#         if owner.id is None:
#             raise DeveloperAccessDenied(
#                 "Developer profile must be persisted",
#                 user_id=str(user_id),
#             )
#         return owner.id

#     async def get_all_questions(
#         self, user_id: ID, collection_id: ID
#     ) -> Sequence[Question]:
#         await self._require_action(
#             user_id,
#             collection_id,
#             DeveloperCollectionAction.VIEW,
#         )
#         return await self._collections.get_all_questions(collection_id)

#     async def _require_action(
#         self,
#         user_id: ID,
#         collection_id: ID,
#         action: DeveloperCollectionAction,
#     ) -> None:
#         required_level = self._policy.required_level(action)
#         decision = await self._collection_access.has_access(
#             user_id,
#             collection_id,
#             required_level,
#         )
#         if not decision.allowed:
#             raise DeveloperAccessDenied(
#                 decision.reason,
#                 user_id=str(user_id),
#                 question_id=str(collection_id),
#             )

#     def _require_collection(self, collection_id: ID) -> QuestionCollection:
#         collection = self._collections.get_collection(collection_id)
#         if collection is None:
#             raise QuestionCollectionNotFoundError(str(collection_id))
#         return collection
