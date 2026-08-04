from uuid import UUID

from sqlmodel import Session

from backend.access_policy import ResourceAccessService
from backend.auth.model import User
from backend.developer import DeveloperProfile
from backend.developer.services.developer_profile_service import DeveloperProfileService
from backend.question import Question
from backend.question_access.model import QuestionAccess
from backend.question_access.services.question_access_adapter import (
    QuestionAccessAdapter,
)
from backend.shared import ID

type UserRef = User | str | UUID | ID


class QuestionAccessService(
    ResourceAccessService[QuestionAccess, DeveloperProfile, Question]
):
    def __init__(
        self, session: Session, profile_service: DeveloperProfileService
    ) -> None:
        super().__init__(
            adapter=QuestionAccessAdapter(session), profile_service=profile_service
        )
