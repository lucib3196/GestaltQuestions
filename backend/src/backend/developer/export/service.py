from backend.accounts import User
from backend.developer.authorization import DeveloperQuestionAuthorizer
from backend.developer.questions.actions import DeveloperQuestionAction
from backend.question import Question
from backend.question.export import QuestionDownload, QuestionDownloadPayload
from backend.shared import ID


class DeveloperDownloadService:
    """Prepare downloadable developer-owned resources."""

    def __init__(
        self, downloader: QuestionDownload, authorizer: DeveloperQuestionAuthorizer
    ) -> None:
        self._downloader = downloader
        self._authorizer = authorizer

    async def download_question(
        self, user: User | ID, question: Question | ID
    ) -> QuestionDownloadPayload:
        await self._authorizer.require_action(
            user, question, DeveloperQuestionAction.DOWNLOAD
        )
        return await self._downloader.download(question)

    @staticmethod
    def _resolve_question_id(question: Question | ID) -> ID:
        if isinstance(question, Question):
            return question.id
        return question
