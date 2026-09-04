from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery

from backend.question.collections import QuestionCollection, QuestionCollectionLink
from backend.question.views.services import QuestionTableExtension


class PersonalQuestionCollectionExtension(QuestionTableExtension):
    """Filters personal question rows by collection id or collection title."""

    def __init__(
        self,
        *,
        collection_id: UUID | None = None,
        collection_title: str | None = None,
    ) -> None:
        """Store the collection filters to apply to the question table."""
        self._collection_id = collection_id
        self._collection_title = collection_title

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Join collection tables and apply collection filters."""
        stmt = stmt.join(
            QuestionCollectionLink,
            QuestionCollectionLink.question_id == question_table.c.question_id,  # type: ignore
        ).join(
            QuestionCollection,
            QuestionCollection.id == QuestionCollectionLink.collection_id,  # type: ignore
        )

        if self._collection_id is not None:
            stmt = stmt.where(QuestionCollection.id == self._collection_id)  # type: ignore

        if self._collection_title:
            stmt = stmt.where(QuestionCollection.title.ilike(self._collection_title))  # type: ignore

        return stmt
