from __future__ import annotations

from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.developer.questions import DeveloperQuestionService
from backend.question import Status
from backend.question.importer import (
    MissingQuestionMetadataError,
    QuestionImporter,
    QuestionPackage,
    ZipQuestionImporter,
    ZipQuestionPackage,
)
from backend.question.manager.exceptions import DeveloperQuestionServiceError
from backend.question.models import Question, QuestionSourceReference
from backend.shared import ID


class DeveloperImportService:
    def __init__(
        self,
        session: Session,
        developer_questions: DeveloperQuestionService,
    ) -> None:
        self._session = session
        self._developer_questions = developer_questions

    async def import_question(
        self,
        user_id: ID,
        importer: QuestionImporter,
        source: Any,
        status: Status | None = Status.DRAFT,
    ) -> Question:
        question: Question | None = None
        try:
            package = importer.prepare_question(source)
            if status is not None:
                package.question.status = status
            return await self._developer_questions.create_question(
                user_id=user_id,
                payload=package.question,
                files=package.files,
            )
            # self._create_source_reference(question, package)
        except MissingQuestionMetadataError as e:
            raise DeveloperQuestionServiceError(
                f"Failed to import question metadata: {e}"
            ) from e
        except Exception as e:
            if question is not None and question.id is not None:
                await self._developer_questions.delete_question(user_id, question.id)
            raise DeveloperQuestionServiceError(
                f"Failed to import question for user {user_id}: {e}"
            ) from e

    def _create_source_reference(
        self, question: Question, package: QuestionPackage
    ) -> QuestionSourceReference:
        if question.id is None:
            raise DeveloperQuestionServiceError(
                "Cannot create source reference before question has an id"
            )

        try:
            source_reference = QuestionSourceReference(
                question_id=question.id,
                source_question_id=str(package.source_question_id),
                raw_metadata=package.raw_metadata,
            )
            self._session.add(source_reference)
            self._session.commit()
            self._session.refresh(source_reference)
            return source_reference
        except SQLAlchemyError as e:
            self._session.rollback()
            raise DeveloperQuestionServiceError(
                f"Failed to create source reference for question {question.id}: {e}"
            ) from e

    async def import_zip_question(
        self,
        user_id: ID,
        content: bytes,
        status: Status | None = Status.DRAFT,
    ) -> Question:
        """Import one question package from raw ZIP archive bytes."""
        return await self.import_question(
            user_id=user_id,
            importer=ZipQuestionImporter(),
            source=ZipQuestionPackage(content=content),
            status=status,
        )
