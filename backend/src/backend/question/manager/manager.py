from typing import Any, Literal, overload

from backend.core import logger
from backend.question.manager.exceptions import (
    InvalidQuestionDataError,
    MissingQuestionDataError,
    QuestionCopyFailure,
    QuestionCreationError,
    QuestionDeletionError,
    QuestionManagerException,
    QuestionNotFound,
    QuestionUpdateError,
)
from backend.question.models import Question
from backend.question.schema import QuestionCreate, QuestionRead, QuestionUpdate
from backend.question.services.question import QuestionDB
from backend.question.storage import QuestionStorageException, StoragePathNotFoundError
from backend.shared import ID
from backend.storage import FileData, Storage
from backend.utils import safe_dir_name


class QuestionManager:
    """Coordinate question database records with their backing storage files."""

    def __init__(self, storage: Storage, qdb: QuestionDB) -> None:
        """Create a manager backed by a storage implementation and question DB."""
        from backend.question.storage.file_service import QuestionStorage

        self.qdb = qdb
        self.storage = storage
        self.files = QuestionStorage.from_session(storage, qdb.session)
        logger.debug("QuestionManager initialized with %s", storage.__class__.__name__)

    async def create_question(
        self,
        qdata: QuestionCreate,
        storage_base_path: str,
        files: list[FileData] | None = None,
    ) -> Question:
        """Create a question record and optionally save its initial files.

        If file storage fails after the database record is created, the manager
        rolls back the newly created question and any files saved in this call.
        """
        question: Question | None = None
        saved_files: list[str] = []

        try:
            qdata = self._validate_question_data(qdata)
            question = await self.qdb.create_question(qdata)

            question_slug = safe_dir_name(
                question.title or "Untitled Question", max_length=80
            )
            storage_path = (
                f"{storage_base_path.rstrip('/')}/questions/"
                f"{question_slug}_{str(question.id)[:8]}/"
            )
            question = await self.qdb.set_question_path(question.id, path=storage_path)

            if not question.storage_path:
                raise StoragePathNotFoundError(str(question.id))
            if files:
                saved_files = await self.files.upload_files(question, files)
            logger.info("Created question %s", question.id)
            return question
        except (QuestionManagerException, QuestionStorageException):
            if question is not None:
                logger.warning(
                    "Rolling back question %s after create failure", question.id
                )
                await self._rollback_created_question(question, saved_files)
            raise
        except Exception as e:
            if question is not None:
                logger.warning(
                    "Rolling back question %s after unexpected create failure",
                    question.id,
                )
                await self._rollback_created_question(question, saved_files)
            raise QuestionCreationError("database or storage error", str(e)) from e

    @overload
    async def get_question(
        self,
        qid: ID,
        method: Literal["default"] = "default",
    ) -> Question: ...

    @overload
    async def get_question(
        self,
        qid: ID,
        method: Literal["full"],
    ) -> QuestionRead: ...

    async def get_question(
        self, qid: ID, method: Literal["default", "full"] = "default"
    ) -> Question | QuestionRead:
        if method == "default":
            q = await self.qdb.get_question(qid)
        elif method == "full":
            q = await self.qdb.get_question_data(qid)
        else:
            raise ValueError("Method {method} is not allowed for method get_question")
        if not q:
            raise QuestionNotFound(str(qid))
        return q

    async def copy_question(self, qid: ID, storage_base_path: str) -> Question:
        try:
            question = await self.qdb.get_question_data(qid)
            qdata = QuestionCreate(
                topics=question.topics,
                qType=question.qType,
                title=f"{question.title}_copy",
                ai_generated=question.ai_generated,
                isAdaptive=question.isAdaptive,
            )
            qfiles = await self.files.get_filedata(qid)
            return await self.create_question(
                qdata, storage_base_path=storage_base_path, files=qfiles
            )
        except (QuestionManagerException, QuestionStorageException):
            raise
        except Exception as e:
            raise QuestionCopyFailure(
                reason="Failed to copy question ", details=str(e)
            ) from e

    async def update_question_meta(
        self, id: ID, update: QuestionUpdate
    ) -> QuestionRead:
        """Update database-backed question metadata and relationship fields."""
        try:
            logger.debug("Updating question metadata for %s", id)
            return await self.qdb.update_question(id, update)
        except (QuestionManagerException, QuestionStorageException):
            raise
        except Exception as e:
            raise QuestionUpdateError(question_id=str(id), reason=str(e)) from e

    async def delete_question(self, qid: ID) -> bool:
        """Delete a question record and its storage directory.

        Storage files are snapshotted first so they can be restored if the
        storage delete succeeds but the database delete fails.
        """
        storage_path = ""
        storage_snapshot: list[FileData] = []

        try:
            logger.debug("Deleting question %s", qid)
            storage_path = await self.get_storage_path(qid)
            storage_snapshot = self.files.snapshot_dir(storage_path)
            self.files.delete_dir(storage_path)
            logger.info(f"Deleted dir {storage_path}")
            await self.qdb.delete_question(qid)
            logger.info("Deleted question %s", qid)
            return True
        except (QuestionManagerException, QuestionStorageException):
            raise
        except Exception as e:
            details = str(e)
            if storage_path:
                logger.warning(
                    "Restoring storage files for question %s after delete failure",
                    qid,
                )
                try:
                    self.files.restore_files(storage_path, storage_snapshot)
                except QuestionStorageException as restore_error:
                    logger.exception(
                        "Failed to restore storage files for question %s",
                        qid,
                    )
                    details = f"{details}; storage restore failed: {restore_error}"
            raise QuestionDeletionError(
                question_id=str(qid),
                reason="database or storage error",
                details=details,
            ) from e

    async def get_question_files(self, question: Question | ID) -> list[str]:
        """Return storage paths for files attached to a question."""
        return await self.files.list_files(question)

    async def read_file(self, question: Question | ID, filename: str) -> bytes | None:
        """Read one file from a question's storage directory."""
        return await self.files.read_file(question, filename)

    async def write_file(
        self,
        question: Question | ID,
        filename: str,
        data: Any,
    ) -> str:
        """Write or replace one file in a question's storage directory."""
        return await self.files.write_file(question, filename, data)

    async def delete_file(self, question: Question | ID, filename: str) -> None:
        """Delete one file from a question's storage directory."""
        return await self.files.delete_file(question, filename)

    async def rename_file(
        self,
        question: Question | ID,
        old_filename: str,
        new_filename: str,
    ) -> str:
        """Rename one file in a question's storage directory."""
        return await self.files.rename_file(question, old_filename, new_filename)

    async def get_question_filedata(self, question: Question | ID) -> list[FileData]:
        """Return every question file as FileData objects."""
        return await self.files.get_filedata(question)

    async def upload_files(
        self,
        question: Question | ID,
        files: list[FileData],
    ) -> list[str]:
        """Save additional files to an existing question.

        If one file fails after earlier files were saved, the files saved during
        this call are removed before the error is raised.
        """
        return await self.files.upload_files(question, files)

    async def get_storage_path(self, question: Question | ID) -> str:
        """Resolve the persisted storage path for a question."""
        return await self.files.get_storage_path(question)

    def _validate_question_data(self, question_data: QuestionCreate) -> QuestionCreate:
        """Validate the required fields needed to create a question."""
        try:
            if not question_data.title:
                raise MissingQuestionDataError("title")
            return question_data
        except QuestionManagerException:
            raise
        except Exception as e:
            raise InvalidQuestionDataError("question_data", str(e)) from e

    async def _rollback_created_question(
        self, question: Question, saved_files: list[str]
    ) -> None:
        """Best-effort cleanup for a question created during a failed operation."""
        rollback_error = self.files.rollback_saved_files(saved_files)
        if rollback_error is not None:
            logger.warning(
                "Failed to roll back saved files for question %s: %s",
                question.id,
                rollback_error,
            )
        if not question.id:
            return
        try:
            await self.qdb.delete_question(question.id)
        except Exception:
            logger.exception(
                "Failed to roll back created question %s after create failure",
                question.id,
            )
