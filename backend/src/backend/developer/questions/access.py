from backend.authorization.resources import ResourceAccessAdapter, ResourceAccessService
from backend.authorization.types import AccessLevel
from backend.developer.collections.access import QuestionCollectionAccessService
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.question import Question
from backend.question.access.models import QuestionAccess
from backend.question.collections import (
    QuestionCollectionAccess,
    QuestionCollectionService,
)


class QuestionAccessService(
    ResourceAccessService[QuestionAccess, DeveloperProfile, Question]
):
    def __init__(
        self,
        adapter: ResourceAccessAdapter[QuestionAccess, DeveloperProfile, Question],
        profile_service: DeveloperProfileService,
        collection_access: QuestionCollectionAccessService | None = None,
        collection_service: QuestionCollectionService[DeveloperProfile] | None = None,
    ) -> None:
        super().__init__(adapter=adapter, profile_service=profile_service)
        self._collection_access = collection_access
        self._collection_service = collection_service

    # Overrides the retrieve access from the base, calls the baseclass implementation
    async def retrieve_access(
        self, requester: DeveloperProfile, resource: Question
    ) -> QuestionAccess | None:
        direct_access = await super().retrieve_access(requester, resource)
        if direct_access is not None:
            return direct_access

        inherited_level = await self._get_inherited_collection_access(
            requester, resource
        )
        if inherited_level is None:
            return None
        assert resource.id
        return QuestionAccess(
            question_id=resource.id,
            developer_id=requester.id,
            granted_by_id=None,
            access_level=inherited_level,
        )

    async def _get_inherited_collection_access(
        self, requester: DeveloperProfile, question: Question
    ) -> AccessLevel | None:
        # TODO: Replace with a batch access check if questions commonly belong to many shared collections.
        if self._collection_access is None or self._collection_service is None:
            return None
        collections = await self._collection_service.get_collections_for_question(
            question
        )
        best_level: AccessLevel | None = None
        decision: QuestionCollectionAccess | None = None
        for collection in collections:
            result = await self._collection_access.check_access(requester, collection)
            decision = result.access

            if decision is None:
                continue
            best_level = self._max_access_level(best_level, decision.access_level)
        return best_level

    def _max_access_level(
        self, current: AccessLevel | None, candidate: AccessLevel
    ) -> AccessLevel:
        if current is None:
            return candidate
        if self._ACCESS_LEVEL_RANK[candidate] > self._ACCESS_LEVEL_RANK[current]:
            return candidate
        return current
