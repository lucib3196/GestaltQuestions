from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy.sql import Select
from sqlmodel import Session

from backend.question.views.schema import QuestionSearchParamsBase, QuestionTableRowBase

from .question_table_composer import QuestionTableQueryComposer


class QuestionTable:
    """Executes question table queries and validates rows into response models."""

    def __init__(
        self,
        session: Session,
        composer: QuestionTableQueryComposer | None = None,
        row_model: type[QuestionTableRowBase] = QuestionTableRowBase,
    ) -> None:
        """Initialize the table service with a session, composer, and row model."""
        self._session = session
        self._composer = composer or QuestionTableQueryComposer(session)
        self._row_model = row_model

    def search(
        self,
        params: QuestionSearchParamsBase | None = None,
    ) -> Sequence[QuestionTableRowBase]:
        """Return validated question table rows matching the search parameters."""
        search = self._composer.search(params)
        return self._execute(search)

    def search_by_id(self, qid: UUID) -> Sequence[QuestionTableRowBase]:
        """Return validated question table rows matching the question id."""
        return self._execute(self._composer.by_id(qid))

    def _execute(self, stmt: Select[Any]) -> Sequence[QuestionTableRowBase]:
        """Execute a statement and validate each mapping with the row model."""
        rows = self._session.execute(stmt).mappings().all()
        print("Rows", rows)
        return [self._row_model.model_validate(row) for row in rows]
