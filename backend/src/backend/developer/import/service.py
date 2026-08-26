from __future__ import annotations

from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session
from backend.question import Status
from backend.developer.questions import DeveloperQuestionService
from backend.question.importer import (
    QuestionImporter,
    QuestionPackage,
    ZipQuestionImporter,
    ZipQuestionPackage,
)
from backend.question.manager.exceptions import DeveloperQuestionServiceError
from backend.question.models import Question, QuestionSourceReference
from backend.shared import ID


class DeveloperQuestionImportService:
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
    ):
        package = importer.prepare_question(source)
        if status:
            package.question.status = status
        question = await self._developer_questions.create_question(
            user_id=user_id,
            payload=package.question,
            files=package.files,
        )
        self._create_source_reference(question, package)
        return question

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

    async def import_zip_question(self, user_id: ID, content: bytes) -> Question:
        """Import one question package from raw ZIP archive bytes."""
        return await self.import_question(
            user_id=user_id,
            importer=ZipQuestionImporter(),
            source=ZipQuestionPackage(content=content),
        )
