from backend.authorization.resources import ResourceAuthorizer
from backend.developer import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.developer.questions.actions import DeveloperQuestionAction
from backend.question import Question
from backend.question.access import QuestionAccess, QuestionAccessDenied

from .access import QuestionAccessService
from .actions import DeveloperQuestionPolicy


class DeveloperQuestionAuthorizer(
    ResourceAuthorizer[
        QuestionAccess, DeveloperProfile, Question, DeveloperQuestionAction
    ]
):
    def __init__(
        self,
        question_access: QuestionAccessService,
        profile: DeveloperProfileService,
        policy: DeveloperQuestionPolicy | None = None,
    ) -> None:
        super().__init__(
            access=question_access,
            profile=profile,
            policy=policy or DeveloperQuestionPolicy(),
            denied_error=lambda reason, user_id, resource_id: QuestionAccessDenied(
                reason,
                user_id=user_id,
                question_id=resource_id,
            ),
        )
