from backend.access_policy import ResourceAccessAdapter, ResourceAccessService
from backend.developer.model import DeveloperProfile
from backend.developer.services.developer_profile_service import DeveloperProfileService
from backend.question import Question
from backend.question_access.model import QuestionAccess
from backend.question_collections.model import (
    QuestionCollection,
    QuestionCollectionAccess,
)


class QuestionCollectionAccessService(
    ResourceAccessService[
        QuestionCollectionAccess, DeveloperProfile, QuestionCollection
    ]
):
    def __init__(
        self,
        adapter: ResourceAccessAdapter[
            QuestionCollectionAccess, DeveloperProfile, QuestionCollection
        ],
        profile_service: DeveloperProfileService,
    ) -> None:
        super().__init__(adapter=adapter, profile_service=profile_service)


class QuestionAccessService(
    ResourceAccessService[QuestionAccess, DeveloperProfile, Question]
):
    def __init__(
        self,
        adapter: ResourceAccessAdapter[QuestionAccess, DeveloperProfile, Question],
        profile_service: DeveloperProfileService,
    ) -> None:
        super().__init__(adapter=adapter, profile_service=profile_service)
