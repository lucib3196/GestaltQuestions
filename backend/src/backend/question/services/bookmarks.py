from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.question.exceptions import QuestionNotFound, QuestionReadError
from backend.question.models import Question, QuestionBookmark
from backend.question.schema import Status


class QuestionBookmarkService:
    def __init__(self, session: Session) -> None:
        self._session = session

    async def list_bookmarks(self, user_id: UUID) -> Sequence[UUID]:
        try:
            stmt = (
                select(QuestionBookmark.question_id)
                .join(Question, Question.id == QuestionBookmark.question_id)
                .where(
                    QuestionBookmark.user_id == user_id,
                    Question.status == Status.PUBLISHED,
                )
                .order_by(QuestionBookmark.created_at.desc())
            )
            return self._session.exec(stmt).all()
        except SQLAlchemyError as e:
            raise QuestionReadError(f"Failed to retrieve question bookmarks: {e}") from e

    async def add_bookmark(self, user_id: UUID, question_id: UUID) -> bool:
        question = self._session.get(Question, question_id)
        if question is None or question.status != Status.PUBLISHED:
            raise QuestionNotFound(question_id)

        bookmark_id = (user_id, question_id)
        if self._session.get(QuestionBookmark, bookmark_id) is not None:
            return True

        try:
            self._session.add(
                QuestionBookmark(user_id=user_id, question_id=question_id)
            )
            self._session.commit()
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionReadError(f"Failed to bookmark question: {e}") from e

    async def remove_bookmark(self, user_id: UUID, question_id: UUID) -> bool:
        bookmark = self._session.get(QuestionBookmark, (user_id, question_id))
        if bookmark is None:
            return True

        try:
            self._session.delete(bookmark)
            self._session.commit()
            return True
        except SQLAlchemyError as e:
            self._session.rollback()
            raise QuestionReadError(
                f"Failed to remove question bookmark: {e}"
            ) from e
