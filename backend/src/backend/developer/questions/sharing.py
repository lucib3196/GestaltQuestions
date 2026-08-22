from backend.authorization.resources import (
    ResourceAccessService,
    ResourceSharingService,
)
from backend.developer.model import DeveloperProfile
from backend.question import Question
from backend.question.access.models import QuestionAccess


class QuestionSharing(
    ResourceSharingService[
        QuestionAccess,
        DeveloperProfile,
        Question,
    ]
):
    def __init__(
        self,
        access_service: ResourceAccessService[
            QuestionAccess,
            DeveloperProfile,
            Question,
        ],
    ) -> None:
        super().__init__(access_service=access_service)
