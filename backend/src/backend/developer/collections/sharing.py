from backend.authorization.resources import (
    ResourceAccessService,
    ResourceSharingService,
)
from backend.developer.model import DeveloperProfile
from backend.question.collections.models import (
    QuestionCollection,
    QuestionCollectionAccess,
)
from backend.question.collections.services.question_collection_access_adapter import (
    DetailRead,
)


class CollectionSharing(
    ResourceSharingService[
        QuestionCollectionAccess,
        DeveloperProfile,
        QuestionCollection,
    ]
):
    def __init__(
        self,
        access_service: ResourceAccessService[
            QuestionCollectionAccess, DeveloperProfile, QuestionCollection, DetailRead
        ],
    ) -> None:
        super().__init__(access_service=access_service)
