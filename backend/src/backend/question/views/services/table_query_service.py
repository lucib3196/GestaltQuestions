from collections.abc import Sequence
from typing import Literal, TypeVar, overload

from pydantic import BaseModel
from sqlalchemy import TextClause, text
from sqlmodel import Session

from backend.question.views.schema import QuestionSearchParams, QuestionTableRow

from .table_filter_builder import QuestionTableFilterBuilder
from .table_sources import (
    BaseQuestionTableSource,
    QuestionTableSourceBuilder,
    TableQuerySource,
)

VALID_VIEWS = Literal["dashboard_with_collections"]


RowModelT = TypeVar("RowModelT", bound=BaseModel)


class TableQueryService:
    def __init__(
        self,
        session: Session,
        view_name: VALID_VIEWS = "dashboard_with_collections",
        source: QuestionTableSourceBuilder | None = None,
        row_model: type[QuestionTableRow] = QuestionTableRow,
    ) -> None:
        self._session = session
        self._view_name = view_name
        self._source = source or BaseQuestionTableSource()
        self._row_model = row_model

    @overload
    def search(
        self,
        params: QuestionSearchParams | None = None,
        *,
        source: QuestionTableSourceBuilder | None = None,
        row_model: None = None,
    ) -> Sequence[QuestionTableRow]: ...

    @overload
    def search(
        self,
        params: QuestionSearchParams | None = None,
        *,
        source: QuestionTableSourceBuilder | None = None,
        row_model: type[RowModelT],
    ) -> Sequence[RowModelT]:
        ...

    def search(
        self,
        params: QuestionSearchParams | None = None,
        *,
        source: QuestionTableSourceBuilder | None = None,
        row_model: type[RowModelT] | None = None,
    ) -> Sequence[QuestionTableRow] | Sequence[RowModelT]:
        model = row_model or self._row_model
        query = self.build_query(params, source=source)
        result = self._session.execute(query)
        rows = result.mappings().all()
        return [model.model_validate(dict(row)) for row in rows] # type: ignore

    def build_query(
        self,
        params: QuestionSearchParams | None = None,
        *,
        source: QuestionTableSourceBuilder | None = None,
        distinct_questions: bool = True,
    ) -> TextClause:
        params = params or QuestionSearchParams()
        query_source = (source or self._source).build(self._view_name)

        filter_where_sql, filter_params = QuestionTableFilterBuilder(
            params=params,
        ).build()

        where_sql = self.combine_where_sql(
            list(query_source.where_clauses),
            filter_where_sql,
        )
        query_params = {
            **query_source.params,
            **filter_params,
        }

        if distinct_questions:
            statement = self._distinct_query(query_source, where_sql)
        else:
            statement = self._regular_query(query_source, where_sql)
        return statement.bindparams(**query_params)

    def _regular_query(self, source: TableQuerySource, where_sql: str) -> TextClause:
        return text(f"""
            SELECT {source.select_sql}
            FROM {source.from_sql}
            {where_sql}
            ORDER BY table_view.updated_at DESC NULLS LAST,
                    table_view.created_at DESC
            LIMIT :limit
            OFFSET :offset
        """)

    def _distinct_query(self, source: TableQuerySource, where_sql: str) -> TextClause:
        return text(f"""
            SELECT *
            FROM (
                SELECT
                    {source.select_sql},
                    row_number() OVER (
                        PARTITION BY table_view.question_id
                        ORDER BY table_view.updated_at DESC NULLS LAST,
                                table_view.created_at DESC
                    ) AS row_number
                FROM {source.from_sql}
                {where_sql}
            ) deduped
            WHERE row_number = 1
            ORDER BY updated_at DESC NULLS LAST, created_at DESC
            LIMIT :limit
            OFFSET :offset
        """)

    @staticmethod
    def combine_where_sql(source_clauses: list[str], filter_where_sql: str) -> str:
        clauses = list(source_clauses)
        if filter_where_sql:
            filter_sql = filter_where_sql.removeprefix("WHERE ").strip()
            clauses.append(filter_sql)
        if not clauses:
            return ""
        return "WHERE " + " AND ".join(f"({clause})" for clause in clauses)
