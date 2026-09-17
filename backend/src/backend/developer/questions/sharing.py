from backend.authorization.resources import ResourceSharingService
from backend.authorization.types import AccessLevel
from backend.developer.model import DeveloperProfile
from backend.developer.questions.access import QuestionAccessService
from backend.question import Question
from backend.question.access.models import QuestionAccess
from backend.question.access.schema import (
    ShareQuestionBatchResult,
    ShareQuestionFailure,
)
from backend.shared import ID


class QuestionSharing(
    ResourceSharingService[QuestionAccess, DeveloperProfile, Question]
):
    def __init__(self, access_service: QuestionAccessService) -> None:
        super().__init__(access_service=access_service)

    async def share_questions_with_users(
        self,
        owner: ID | DeveloperProfile,
        question_ids: list[ID],
        target_user_ids: list[ID],
        level: AccessLevel,
    ) -> ShareQuestionBatchResult:
        result = await self.batch_share_resources(
            owner=owner,
            targets=target_user_ids,
            resources=question_ids,
            level=level,
        )

        return ShareQuestionBatchResult(
            shared=result.shared,
            failed=[
                ShareQuestionFailure(
                    question_id=failure.resource_id,
                    target_user_id=failure.target_user_id,
                    reason=failure.reason,
                )
                for failure in result.failed
            ],
        )
