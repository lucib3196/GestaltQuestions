from backend.authorization.resources import ResourceAccessAdapter, ResourceAccessService
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
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
