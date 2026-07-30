from __future__ import annotations

import asyncio
import json
from collections.abc import Sequence
from typing import TYPE_CHECKING, Any, Literal

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.core import logger
from backend.developer.exceptions import (
    DeveloperAccessDenied,
    DeveloperProfileError,
)
from backend.developer.services import (
    DeveloperProfileService,
)
from backend.question.models import Question
from backend.question.schema import (
    QuestionCreate,
    QuestionFilter,
    QuestionRead,
    QuestionUpdate,
)
from backend.question_manager.exceptions import (
    DeveloperQuestionServiceError,
    QuestionNotFoundError,
)
from backend.shared import ID
from backend.storage import FileData

from .manager import QuestionManager

if TYPE_CHECKING:
    from backend.question_access import QuestionAccessService


class DeveloperQuestionService:
    """Gate developer question actions and coordinate developer-owned question data."""

    def __init__(
        self,
        session: Session,
        question_manager: QuestionManager,
        question_control: QuestionAccessService,
        developer_profiles: DeveloperProfileService,
    ) -> None:

        self._session = session
        self._question_manager = question_manager
        self._developer_profiles = developer_profiles
        self._question_control = question_control

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
        profile = await self._developer_profiles.get_or_create_profile(user_id)
        assert profile.storage_path
        question = await self._question_manager.create_question(
            qdata=payload,
            storage_base_path=profile.storage_path,
            files=files,
        )
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

    async def copy_question(self, qid: ID, user_id: ID):
        """Create a copy question under the developer profile and assign ownership."""
        await self._question_control.require_question_view_access(user_id, qid)
        profile = await self._developer_profiles.get_or_create_profile(user_id)
        assert profile.storage_path

        question = await self._question_manager.copy_question(qid, profile.storage_path)
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

    async def list_my_questions(
        self, user_id: ID, method: Literal["default", "full"] = "default"
    ) -> list[Question] | list[QuestionRead]:
        """List questions created by the developer profile for the user."""
        try:
            profile = await self._developer_profiles.get_developer_data(user_id)
            if not profile:
                raise DeveloperProfileError(
                    "retrieve", str(user_id), "Profile not found"
                )
            logger.debug("Listing questions for developer user %s", user_id)
            if method == "default":
                return profile.created_questions
            return await asyncio.gather(
                *(
                    self._question_manager.qdb.get_question_data(q.id)
                    for q in profile.created_questions
                )
            )
        except DeveloperQuestionServiceError:
            raise
        except SQLAlchemyError as e:
            raise DeveloperProfileError("list questions", str(user_id), str(e)) from e

    async def get_question(
        self, user_id: ID, qid: ID, method: Literal["full", "simple"] = "simple"
    ) -> Question | QuestionRead:
        """Retrieve a question after checking developer question control."""
        await self._question_control.require_question_view_access(user_id, qid)
        if method == "full":
            q = await self._question_manager.qdb.get_question_data(qid)
        else:
            q = await self._question_manager.qdb.get_question(qid)
        if not q:
            raise QuestionNotFoundError(str(qid))
        return q

    async def update_question(self, user_id: ID, qid: ID, update: QuestionUpdate):
        """Update question metadata after checking developer question control."""
        await self._question_control.require_question_edit_access(user_id, qid)
        return await self._question_manager.update_question_meta(qid, update)

    async def delete_question(self, user_id: ID, qid: ID) -> bool:
        """Delete a question and its storage after checking developer question control."""
        await self._question_control.require_question_delete_access(user_id, qid)
        return await self._question_manager.delete_question(qid)

    # Filtering
    async def filter_questions(
        self, user_id: ID, filter: QuestionFilter
    ) -> Sequence[QuestionRead]:
        try:
            profile = await self._developer_profiles.get_developer_data(user_id)
            assert profile
            add_filter = Question.created_by_id == profile.id
            return await self._question_manager.qdb.filter_questions(
                filter, additional_filters=[add_filter]
            )
        except Exception as e:
            raise ValueError(f"Failed to filer question {e}") from e

    async def prepare_question_download(
        self, user_id: ID, qid: ID
    ) -> dict[str, bytes | bytearray]:
        try:
            qfiles = await self.get_question_filedata(user_id, qid)
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
        except DeveloperAccessDenied:
            raise
        except Exception as e:
            raise ValueError(f"Failed to donwload Question {e}") from e

    # ------------------------------------------------------------------
    # Question Files
    # ------------------------------------------------------------------

    async def get_question_files(self, user_id: ID, qid: ID) -> Sequence[str]:
        """List stored files for a controlled question."""
        await self._question_control.require_question_view_access(user_id, qid)
        return await self._question_manager.get_question_files(qid)

    async def get_question_filedata(self, user_id: ID, qid: ID) -> Sequence[FileData]:
        await self._question_control.require_question_view_access(user_id, qid)
        return await self._question_manager.get_question_filedata(qid)

    async def read_file(self, user_id: ID, qid: ID, filename: str) -> bytes | None:
        """Read a stored question file after checking developer question control."""
        await self._question_control.require_question_view_access(user_id, qid)
        return await self._question_manager.read_file(qid, filename)

    async def write_file(self, user_id: ID, qid: ID, filename: str, data: Any):
        """Write or replace a question file after checking developer question control."""
        await self._question_control.require_question_edit_access(user_id, qid)
        return await self._question_manager.write_file(qid, filename, data)

    async def delete_file(self, user_id: ID, qid: ID, filename: str):
        """Delete a question file after checking developer question control."""
        await self._question_control.require_question_edit_access(user_id, qid)
        return await self._question_manager.delete_file(qid, filename)

    async def upload_files(self, user_id: ID, qid: ID, files: list[FileData]):
        """Upload files to a question after checking developer question control."""
        await self._question_control.require_question_edit_access(user_id, qid)
        return await self._question_manager.upload_files(qid, files)
