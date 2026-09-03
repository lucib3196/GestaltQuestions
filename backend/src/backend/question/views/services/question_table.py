import json
from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy.sql import Select
from sqlmodel import Session

from backend.question import QType
from backend.question.views.schema import QuestionSearchParamsBase, QuestionTableRowBase
from backend.question_runtime.model import RuntimeLanguage

from .question_table_queries import QuestionTableQuery


class QuestionTable:
    def __init__(
        self,
        session: Session,
        query: QuestionTableQuery | None = None,
        row_model: type[QuestionTableRowBase] = QuestionTableRowBase,
    ) -> None:
        self._session = session
        dialect_name = session.get_bind().dialect.name
        self._query = query or QuestionTableQuery(dialect_name=dialect_name)
        self._row_model = row_model

    def search_by_id(self, qid: UUID) -> Sequence[QuestionTableRowBase]:
        return self._execute(self._query.by_id(qid))

    def search(
        self,
        params: QuestionSearchParamsBase | None = None,
    ) -> Sequence[QuestionTableRowBase]:
        return self._execute(self._query.search(params))

    def _execute(self, stmt: Select[Any]) -> Sequence[QuestionTableRowBase]:
        rows = self._session.execute(stmt).mappings().all()
        return [
            self._row_model.model_validate(row)
            for row in rows
        ]

