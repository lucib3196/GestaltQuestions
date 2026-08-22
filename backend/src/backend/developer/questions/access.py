from backend.authorization.resources import ResourceAccessService
from backend.developer.collections.access import QuestionCollectionAccessReader
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.question import Question
from backend.question.access import QuestionAccessAdapter
from backend.question.access.models import QuestionAccess


class QuestionAccessService(
    ResourceAccessService[QuestionAccess, DeveloperProfile, Question]
):
    def __init__(
        self,
        adapter: QuestionAccessAdapter,
        profile_service: DeveloperProfileService,
        access_reader: QuestionCollectionAccessReader,
    ) -> None:
        super().__init__(adapter=adapter, profile_service=profile_service)
        self.access_reader = access_reader

    async def retrieve_access(
        self, requester: DeveloperProfile, resource: Question
    ) -> QuestionAccess | None:
        direct_access = await super().retrieve_access(requester, resource)
        if direct_access is not None:
            return direct_access

        inherited_access = self.access_reader.get_access_for_question_in_collection(
            resource, requester
        )
        if inherited_access is None:
            return None

        assert resource.id
        return QuestionAccess(
            question_id=resource.id,
            developer_id=requester.id,
            granted_by_id=inherited_access.granted_by_id,
            access_level=inherited_access.access_level,
        )
