from backend.accounts import User
from backend.developer import DeveloperProfile, DeveloperProfileError
from backend.developer.profiles import DeveloperProfileService
from backend.developer.questions import DeveloperQuestionPolicy, QuestionAccessService
from backend.developer.questions.actions import DeveloperQuestionAction
from backend.question import Question
from backend.question.access.exceptions import QuestionAccessDenied
from backend.shared import ID


class DeveloperQuestionAuthorizer:
    def __init__(
        self,
        question_access: QuestionAccessService,
        profile: DeveloperProfileService,
        policy: DeveloperQuestionPolicy | None = None,
    ) -> None:
        self._question_access = question_access
        self._policy = policy or DeveloperQuestionPolicy()
        self._profile = profile

    async def require_action(
        self,
        requester: User | ID | DeveloperProfile,
        question: Question | ID,
        action: DeveloperQuestionAction,
    ) -> None:
        requester_id = requester.id if isinstance(requester, User) else requester
        required_level = self._policy.required_level(action)

        access = await self._question_access.has_access(
            requester_id,
            question,
            required_level,
        )

        if not access.allowed:
            raise QuestionAccessDenied(access.reason)

    async def resolve_profile(
        self,
        user: User | ID | DeveloperProfile,
    ) -> DeveloperProfile:
        if isinstance(user, DeveloperProfile):
            return user

        if isinstance(user, User):
            return await self._profile.get_profile(user.id)
        try:
            return await self._profile.get_profile(user)
        except DeveloperProfileError:
            raise
        except Exception as e:
            raise DeveloperProfileError(
                "resolve",
                str(user),
                details=f"{type(e).__name__}: {e}",
            ) from e
