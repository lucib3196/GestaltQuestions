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
    ):
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
            self._row_model.model_validate(self._normalize_row(dict(row)))
            for row in rows
        ]

    @staticmethod
    def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
        for key in ("topics", "question_type", "available_runtimes"):
            value = row.get(key)
            if isinstance(value, str):
                row[key] = [item for item in json.loads(value) if item is not None]
        row["question_type"] = [
            QType[item].value if item in QType.__members__ else item
            for item in row.get("question_type", [])
        ]
        row["available_runtimes"] = [
            RuntimeLanguage[item].value if item in RuntimeLanguage.__members__ else item
            for item in row.get("available_runtimes", [])
        ]
        return row
