from backend.authorization.resources import (
    ResourceSharingService,
)
from backend.developer.questions.access import QuestionAccessService


class QuestionSharing(ResourceSharingService):
    def __init__(self, access_service: QuestionAccessService) -> None:
        super().__init__(access_service=access_service)
