from __future__ import annotations

import json
from collections.abc import Sequence
from typing import Any, Literal

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.core import logger
from backend.developer.exceptions import DeveloperProfileError
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.developer.questions.access import QuestionAccessService
from backend.developer.questions.actions import (
    DeveloperQuestionAction,
    DeveloperQuestionPolicy,
)
from backend.question.access.exceptions import QuestionAccessDenied
from backend.question.manager.exceptions import (
    DeveloperQuestionServiceError,
    QuestionNotFoundError,
)
from backend.question.manager.services.manager import QuestionManager
from backend.question.models import Question
from backend.question.schema import (
    QuestionCreate,
    QuestionFilter,
    QuestionRead,
    QuestionUpdate,
)
from backend.shared import ID
from backend.storage import FileData


class DeveloperQuestionService:
    """Gate developer question actions and coordinate developer-owned question data."""

    def __init__(
        self,
        session: Session,
        question_manager: QuestionManager,
        developer_profiles: DeveloperProfileService,
        question_access: QuestionAccessService,
    ) -> None:

        self._session = session
        self._question_manager = question_manager
        self._developer_profiles = developer_profiles
        self._question_access = question_access
        self._policy = DeveloperQuestionPolicy()

    # ------------------------------------------------------------------
    # Question Lifecycle
    # ------------------------------------------------------------------

    async def create_question(
        self,
        user_id: ID,
        payload: QuestionCreate,
        files: list[FileData] | None = None,
    ) -> Question:
        """Create a question under the developer profile and assign ownership."""
        profile = await self._developer_profiles.get_profile(user_id)
        storage_path = self._require_profile_storage_path(user_id, profile)
        question = await self._question_manager.create_question(
            qdata=payload,
            storage_base_path=storage_path,
            files=files,
        )
        return self._assign_creator(user_id, question, profile)

    async def copy_question(self, qid: ID, user_id: ID):
        """Create a copy question under the developer profile and assign ownership."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.COPY)
        profile = await self._developer_profiles.get_or_create_profile(user_id)
        storage_path = self._require_profile_storage_path(user_id, profile)

        question = await self._question_manager.copy_question(qid, storage_path)
        return self._assign_creator(user_id, question, profile)

    async def get_question(
        self, user_id: ID, qid: ID, method: Literal["full", "simple"] = "simple"
    ) -> Question | QuestionRead:
        """Retrieve a question after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.VIEW)
        if method == "full":
            q = await self._question_manager.qdb.get_question_data(qid)
        else:
            q = await self._question_manager.qdb.get_question(qid)
        if not q:
            raise QuestionNotFoundError(str(qid))
        return q

    async def update_question(self, user_id: ID, qid: ID, update: QuestionUpdate):
        """Update question metadata after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.UPDATE)
        return await self._question_manager.update_question_meta(qid, update)

    async def delete_question(self, user_id: ID, qid: ID) -> bool:
        """Delete a question and its storage after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.DELETE)
        return await self._question_manager.delete_question(qid)

    # Filtering
    async def filter_questions(
        self, user_id: ID, filter: QuestionFilter
    ) -> Sequence[QuestionRead]:
        try:
            profile = await self._developer_profiles.get_profile(user_id)
            if not profile:
                raise DeveloperProfileError(
                    "retrieve", str(user_id), "Profile not found"
                )
            add_filter = Question.created_by_id == profile.id
            return await self._question_manager.qdb.filter_questions(
                filter, additional_filters=[add_filter]
            )
        except DeveloperProfileError:
            raise
        except Exception as e:
            raise DeveloperQuestionServiceError(
                f"Failed to filter questions for user {user_id}: {e}"
            ) from e

    async def prepare_question_download(
        self, user_id: ID, qid: ID
    ) -> dict[str, bytes | bytearray]:
        try:
            await self._require_action(user_id, qid, DeveloperQuestionAction.DOWNLOAD)
            qfiles = await self._question_manager.get_question_filedata(qid)
            file_payload: dict[str, bytes | bytearray] = {}
            for f in qfiles:
                content = f.content
                if isinstance(content, str):
                    content = content.encode()
                elif isinstance(content, dict):
                    content = (json.dumps(content)).encode()

                file_payload[f.filename] = content
            return file_payload

        except QuestionNotFoundError:
            raise
        except QuestionAccessDenied:
            raise
        except Exception as e:
            raise DeveloperQuestionServiceError(
                f"Failed to download question {qid}: {e}"
            ) from e

    # ------------------------------------------------------------------
    # Question Files
    # ------------------------------------------------------------------

    async def get_question_files(self, user_id: ID, qid: ID) -> Sequence[str]:
        """List stored files for a controlled question."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.READ_FILE)
        return await self._question_manager.get_question_files(qid)

    async def get_question_filedata(self, user_id: ID, qid: ID) -> Sequence[FileData]:
        await self._require_action(user_id, qid, DeveloperQuestionAction.READ_FILE)
        return await self._question_manager.get_question_filedata(qid)

    async def read_file(self, user_id: ID, qid: ID, filename: str) -> bytes | None:
        """Read a stored question file after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.READ_FILE)
        return await self._question_manager.read_file(qid, filename)

    async def write_file(self, user_id: ID, qid: ID, filename: str, data: Any):
        """Write or replace a question file after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.WRITE_FILE)
        return await self._question_manager.write_file(qid, filename, data)

    async def delete_file(self, user_id: ID, qid: ID, filename: str):
        """Delete a question file after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.DELETE_FILE)
        return await self._question_manager.delete_file(qid, filename)

    async def upload_files(self, user_id: ID, qid: ID, files: list[FileData]):
        """Upload files to a question after checking developer question control."""
        await self._require_action(user_id, qid, DeveloperQuestionAction.UPLOAD_FILES)
        return await self._question_manager.upload_files(qid, files)

    def _require_profile_storage_path(
        self, user_id: ID, profile: DeveloperProfile
    ) -> str:
        """Return a developer profile storage path or raise a domain error."""
        if not profile.storage_path:
            raise DeveloperProfileError(
                "retrieve storage path",
                str(user_id),
                "Developer profile storage path is not set",
            )
        return profile.storage_path

    def _assign_creator(
        self, user_id: ID, question: Question, profile: DeveloperProfile
    ) -> Question:
        """Assign the developer profile as the creator of a question."""
        try:
            logger.debug(
                "Assigning creator profile %s to question %s", profile.id, question.id
            )
            question.created_by = profile
            self._session.add(question)
            self._session.commit()
            self._session.refresh(question)
            return question
        except SQLAlchemyError as e:
            self._session.rollback()
            logger.warning("Failed assigning creator to question %s", question.id)
            raise DeveloperProfileError(
                "assign question creator", str(user_id), str(e)
            ) from e

    # Determines the level of action required by the user
    async def _require_action(
        self, user_id: ID, question_id: ID, action: DeveloperQuestionAction
    ) -> None:
        """Require the access level mapped to a developer question action."""
        required_level = self._policy.required_level(action)
        access = await self._question_access.has_access(
            user_id, question_id, required_level
        )
        if not access.allowed:
            raise Exception(f"Access not allowed {access.reason}")
