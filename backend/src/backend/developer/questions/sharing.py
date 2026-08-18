from backend.authorization.resources import (
    ResourceAccessService,
    ResourceSharingService,
)
from backend.developer.model import DeveloperProfile
from backend.question_access.model import QuestionAccess
from backend.question import Question


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
