import asyncio
from pathlib import Path
from typing import Any, Dict, Literal, Sequence
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from pathlib import PurePosixPath
from sqlmodel import Session, delete, select

from src.data import generic as gdb
from src.data.question_exceptions import (
    QuestionCreateError,
    QuestionDeleteError,
    QuestionNotFoundError,
    QuestionPathError,
    QuestionReadError,
    QuestionStorageTypeError,
    QuestionUpdateError,
    QuestionValidationError,
)
from src.core import logger
from src.model.question import (
    Language,
    Question,
    QuestionData,
    QuestionType,
    Topic,
)
from src.app_types.general import STORAGE_TYPE, ID
from src.utils import convert_uuid


class QuestionDB:
    def __init__(self, session: Session):
        """
        Initialize the question data access layer.

        Args:
            session: Active SQLModel session used for database operations.
        """
        self.session = session
        self.metadata_rel = ["topics", "languages", "qTypes"]
        self.excluded_fields = self.metadata_rel

    async def create_question(
        self,
        question: QuestionData | dict,
        *,
        created_by: UUID | None = None,
        storage_type: STORAGE_TYPE | None = None,
    ) -> Question:
        """
        Create a question record and attach its relationships.

        Args:
            question: Question payload as a validated model or raw dict.
            created_by: Optional developer profile ID to store as the creator.

        Returns:
            The created Question ORM instance.
        """
        question = self.validate_data(question)
        if created_by and not question.question_path:
            raise QuestionValidationError(
                "question_path is required when created_by is provided."
            )
        if question.question_path:
            question.question_path = PurePosixPath(question.question_path).as_posix()
        if created_by and not storage_type:
            raise QuestionValidationError(
                "storage_type is required when created_by is provided."
            )
        logger.debug("This is the question %s", question)
        question_orm = Question(
            **question.model_dump(exclude=set(self.excluded_fields)),
            created_by_id=created_by,
        )

        self.session.add(question_orm)
        question_orm = await self._attach_question_relationships(question_orm, question)
        self.session.add(question_orm)
        # persist to database
        try:
            self.session.commit()
            self.session.refresh(question_orm)
            if created_by and question.question_path and storage_type:
                question_orm = await self.set_question_path(
                    question_orm.id,
                    storage_type,
                    question.question_path,
                )
            return question_orm
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to create question")
            raise QuestionCreateError(f"Failed to create question: {e}") from e

    async def get_questions_by_creator(
        self, created_by_id: UUID | str
    ) -> Sequence[Question]:
        """
        Retrieve all questions created by a specific developer profile.

        Args:
            created_by_id: Developer profile identifier.

        Returns:
            A sequence of Question ORM instances owned by the creator.
        """
        try:
            questions = self.session.exec(
                select(Question).where(
                    Question.created_by_id == convert_uuid(created_by_id)
                )
            ).all()
            return questions
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to retrieve questions by creator")
            raise QuestionReadError(
                f"Failed to retrieve questions for creator '{created_by_id}': {e}"
            ) from e

    async def get_question(self, qid: ID) -> Question | None:
        """
        Retrieve a question by its identifier.

        Args:
            qid: Question identifier.

        Returns:
            The matching Question ORM instance, or None if not found.
        """
        if qid is None:
            raise QuestionValidationError("Question id cannot be None.")

        try:
            question_id = convert_uuid(qid)
            return self.session.exec(
                select(Question).where(Question.id == question_id)
            ).first()
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to retrieve question")
            raise QuestionReadError(f"Failed to retrieve question '{qid}': {e}") from e

    async def get_all_questions(
        self,
        offset: int = 0,
        limit: int = 100,
        method: Literal["default", "full"] = "default",
    ) -> Sequence[Question | QuestionData]:
        """
        Retrieve a paginated list of questions.

        Args:
            offset: Number of rows to skip.
            limit: Maximum number of rows to return.
            method: Return raw ORM models with ``default`` or expanded data with ``full``.

        Returns:
            A sequence of Question models or QuestionData models depending on ``method``.
        """
        try:
            all_questions = self.session.exec(
                select(Question).offset(offset).limit(limit)
            ).all()

            if method == "default":
                return all_questions
            if method == "full":
                return await asyncio.gather(
                    *[self.get_question_data(q.id) for q in all_questions]
                )
            raise QuestionValidationError(
                f"Unsupported get_all_questions method '{method}'."
            )
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to retrieve questions")
            raise QuestionReadError(f"Failed to retrieve questions: {e}") from e

    async def get_question_data(self, qid: ID) -> QuestionData:
        """
        Retrieve a question and expand its relationship fields into QuestionData.

        Args:
            qid: Question identifier.

        Returns:
            A QuestionData representation of the stored question.
        """
        q = await self.get_question(qid)
        if not q:
            raise QuestionNotFoundError(f"Question '{qid}' was not found.")
        question_data = q.model_dump(exclude=set(self.metadata_rel))
        relationship_data = await self.get_question_relationship_data(q)
        q = QuestionData(**question_data, **relationship_data)
        return q

    async def update_question(
        self,
        qid: ID,
        update: QuestionData | dict,
    ) -> QuestionData:
        """
        Update a question and its relationship metadata.

        Args:
            qid: Question identifier.
            update: Partial or full question payload to apply.

        Returns:
            The updated question as QuestionData.
        """

        q = await self.get_question(qid)
        if not q:
            raise QuestionNotFoundError(f"Question '{qid}' was not found.")

        update_data = self.validate_data(update)
        q = await self._attach_question_relationships(q, update_data)

        try:
            for k, v in update_data.model_dump(
                exclude=set(self.metadata_rel),
                exclude_unset=True,
            ).items():
                setattr(q, k, v)

            self.session.commit()
            self.session.refresh(q)

            return await self.get_question_data(q.id)

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to update question")
            raise QuestionUpdateError(f"Failed to update question '{qid}': {e}") from e

    async def delete_question(
        self,
        qid: ID,
    ) -> bool:
        """
        Delete a single question by identifier.

        Args:
            qid: Question identifier.

        Returns:
            True when the question was deleted, otherwise False if it was not found.
        """
        q = await self.get_question(qid)
        if q is None:
            logger.warning("[QuestionDB] Cannot delete question '%s'; not found.", qid)
            return False
        try:
            self.session.delete(q)
            self.session.commit()
            self.session.flush()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to delete question")
            raise QuestionDeleteError(f"Failed to delete question '{qid}': {e}") from e

    async def delete_all_questions(self) -> bool:
        """
        Delete all stored questions.

        Returns:
            True when the delete operation completes successfully.
        """
        try:
            statement = delete(Question)
            self.session.exec(statement)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to delete all questions")
            raise QuestionDeleteError(f"Failed to delete all questions: {e}") from e

    # Setter and Getters
    async def get_question_path(self, id: ID, storage_type: STORAGE_TYPE) -> str | None:
        """
        Retrieve the stored path for a question in the requested storage backend.

        Args:
            id: Question identifier.
            storage_type: Storage backend selector, such as ``local`` or ``cloud``.

        Returns:
            The stored path string, or None if no path has been set.
        """
        question = await self.get_question(id)
        if not question:
            raise QuestionNotFoundError(f"Question '{id}' was not found.")
        if storage_type == "cloud":
            path = question.blob_path
        elif storage_type == "local":
            path = question.local_path
        else:
            raise QuestionStorageTypeError(
                f"Invalid storage type '{storage_type}'. Expected 'cloud' or 'local'."
            )
        return path

    async def set_question_path(
        self, id: ID, storage_type: STORAGE_TYPE, path: Path | str
    ):
        """
        Persist a question path for the requested storage backend.

        Args:
            id: Question identifier.
            storage_type: Storage backend selector, such as ``local`` or ``cloud``.
            path: Filesystem or storage path to persist.

        Returns:
            The updated Question ORM instance.
        """
        question = await self.get_question(id)
        if not question:
            raise QuestionNotFoundError(f"Question '{id}' was not found.")
        path_str = PurePosixPath(path).as_posix() + "/"
        try:
            if storage_type == "cloud":
                question.blob_path = path_str
            elif storage_type == "local":
                question.local_path = path_str
            else:
                raise QuestionStorageTypeError(
                    f"Invalid storage type '{storage_type}'. Expected 'cloud' or 'local'."
                )

            self.session.add(question)
            self.session.commit()
            self.session.refresh(question)
            return question

        except SQLAlchemyError as e:
            self.session.rollback()
            logger.exception("[QuestionDB] Failed to update question path")
            raise QuestionPathError(
                f"Failed to update question path for '{id}': {e}"
            ) from e

    # Utils
    async def _attach_question_relationships(
        self, question: Question, data: dict | QuestionData
    ) -> Question:
        """
        Attach topic, language, and question-type relationships to a question.

        Args:
            question: Question ORM instance being created or updated.
            data: Question payload containing relationship names.

        Returns:
            The same Question instance with relationships attached.
        """
        data = self.validate_data(data)
        # Extract relationship meta
        topic_names = data.topics
        language_names = data.languages
        qtype_names = data.qTypes

        question.topics = await gdb.get_or_create_many(self.session, Topic, topic_names)
        question.languages = await gdb.get_or_create_many(
            self.session, Language, language_names
        )
        question.qTypes = await gdb.get_or_create_many(
            self.session, QuestionType, qtype_names
        )
        return question

    async def get_question_relationship_data(self, q: Question) -> Dict[str, Any]:
        """
        Read relationship names from a stored question.

        Args:
            q: Question ORM instance.

        Returns:
            A mapping containing topic, language, and question-type name lists.
        """
        # Get the topics,languages and qtypes
        topics = await gdb.get_relationship_data(q, "topics", mode="list")
        languages = await gdb.get_relationship_data(q, "languages", mode="list")
        qtypes = await gdb.get_relationship_data(q, "qTypes", mode="list")
        relationship_data = {"topics": topics, "languages": languages, "qtypes": qtypes}
        return relationship_data

    def validate_data(self, question: QuestionData | dict) -> QuestionData:
        """
        Validate and normalize raw question input.

        Args:
            question: Question payload as a QuestionData model or raw dict.

        Returns:
            A validated QuestionData instance.
        """
        try:
            data = (
                question.model_dump(exclude={"question_path"}, exclude_none=True)
                if isinstance(question, QuestionData)
                else question
            )
            question = QuestionData.model_validate(data)
            if question.id:
                logger.info("[QDB] Question ID is in data converting")
                question.id = convert_uuid(question.id)
            return question
        except ValidationError as e:
            raise QuestionValidationError(f"Question payload is invalid: {e}") from e
