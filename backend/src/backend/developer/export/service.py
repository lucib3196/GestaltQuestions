from backend.question.manager import QuestionManager
from backend.developer.questions import QuestionAccessService
from backend.developer.questions import DeveloperQuestionPolicy
from backend.question import Question
from backend.accounts import User
from backend.developer import DeveloperProfile
from backend.shared import ID
from backend.developer.profiles import DeveloperProfileService
from backend.developer.questions.actions import DeveloperQuestionAction
import mimetypes
from typing import Dict, Any
import base64
import json
from backend.utils import normalize_content
from backend.storage import FileData
from backend.utils import to_serializable


class DeveloperDownloadService:
    """Prepare downloadable developer-owned resources."""

    def __init__(
        self,
        question_manager: QuestionManager,
        question_access: QuestionAccessService,
        profile: DeveloperProfileService,
    ) -> None:
        self._question_manager = question_manager
        self._question_access = question_access
        self._profile = profile
        self._policy = DeveloperQuestionPolicy()

    async def download_question(self, user: User, question: Question | ID):
        await self.require_action(user, question, DeveloperQuestionAction.DOWNLOAD)
        question_id = self._resolve_question_id(question)
        # Should be replaced at some point
        # Get the question files
        qfiles = await self._question_manager.get_question_filedata(question_id)
        qmeta = await self._question_manager.get_question(question_id)
        payload: Dict[str, bytes | bytearray] = {}
        for f in qfiles:
            content = self.normalize_content(f)
            payload[f.filename] = content
        payload["info2.json"] = qmeta.model_dump_json().encode("utf-8")

    async def require_action(
        self, user: User, question: Question | ID, action: DeveloperQuestionAction
    ):
        required_level = self._policy.required_level(action)
        profile = await self._profile.get_profile(user)
        access = await self._question_access.has_access(
            profile, question, required_level
        )
        if not access.allowed:
            raise Exception(f"Access not allowed for resource")

    @staticmethod
    def normalize_content(file: FileData) -> bytes | bytearray:
        content = file.content
        if isinstance(content, bytes | bytearray):
            return content
        elif isinstance(content, dict):
            content = json.dumps(content).encode("utf-8")
        elif file.mime_type.startswith("image/") and isinstance(content, str):
            return base64.b64decode(content)
        elif isinstance(content, str):
            return content
        else:
            return str(content).encode("utf-8")

    @staticmethod
    def _resolve_question_id(question: Question | ID) -> ID:
        if isinstance(question, Question):
            return question.id
        return question
