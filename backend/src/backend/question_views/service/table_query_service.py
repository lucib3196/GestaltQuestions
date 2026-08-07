from sqlalchemy import TextClause, text
from sqlmodel import Session

from backend.question_views.schema import QuestionSearchParams, QuestionTableRow
from backend.question_views.schema import QuestionTableSearchContext
from collections.abc import Sequence
from .table_filter_builder import QuestionTableFilterBuilder
from typing import Literal
from typing import Sequence

VALID_VIEWS = Literal["dashboard_with_collections"]


class TableQueryService:
    def __init__(
        self,
        session: Session,
        view_name: VALID_VIEWS = "dashboard_with_collections",
    ) -> None:
        self._session = session
        self._view_name = view_name

    def search(
        self,
        params: QuestionSearchParams | None = None,
        *,
        context: QuestionTableSearchContext | None = None,
    ) -> Sequence[QuestionTableRow]:
        query = self._build_query(params, context=context)
        result = self._session.execute(query)
        return [
            QuestionTableRow.model_validate(dict(row))
            for row in result.mappings().all()
        ]

    def _build_query(
        self,
        params: QuestionSearchParams | None = None,
        *,
        context: QuestionTableSearchContext | None = None,
        distinct_questions: bool = True,
    ) -> TextClause:
        params = params or QuestionSearchParams()
        context = context or QuestionTableSearchContext()

        where_sql, query_params = QuestionTableFilterBuilder(
            params=params,
            context=context,
        ).build()
        if distinct_questions:
            statement = self._distinct_query(where_sql)
        else:
            statement = text(f"""
                SELECT *
                FROM {self._view_name} table_view
                {where_sql}
                ORDER BY updated_at DESC NULLS LAST, created_at DESC
                LIMIT :limit
                OFFSET :offset
            """)
        return statement.bindparams(**query_params)

    def _distinct_query(self, where_sql: str):
        statement = text(f"""
            SELECT *
            FROM (
                SELECT
                    table_view.*,
                    row_number() OVER (
                        PARTITION BY question_id
                        ORDER BY updated_at DESC NULLS LAST, created_at DESC
                    ) AS row_number
                FROM {self._view_name} table_view
                {where_sql}
            ) deduped
            WHERE row_number = 1
            ORDER BY updated_at DESC NULLS LAST, created_at DESC
            LIMIT :limit
            OFFSET :offset
        """)
        return statement


if __name__ == "__main__":
    import json

    from backend.database import engine

    with Session(engine) as session:
        result = TableQueryService(session).search(
            params=QuestionSearchParams(search="energy")
        )
        print(json.dumps(result, indent=4, default=str))
