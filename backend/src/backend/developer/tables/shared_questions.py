from collections.abc import Sequence
from datetime import datetime
from typing import Any, cast
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlmodel import Session

from backend.authorization import AccessLevel
from backend.developer.model import DeveloperProfile
from backend.developer.tables.sources import (
    SharedByMeQuestionTableSource,
    SharedWithMeQuestionTableSource,
)
from backend.question import (
    QType,
    Question,
    QuestionQTypeLink,
    QuestionTopicLink,
    QuestionType,
    Topic,
)
from backend.question.access import QuestionAccess
from backend.question.views.schema import QuestionSearchParams, QuestionTableRow
from backend.question.views.services.table_query_service import TableQueryService


def sql(expr: object) -> Any:
    return cast(Any, expr)


def question_table_base_subquery():
    stmt = (
        select(
            (Question.id).label("question_id"),
            Question.title,
            Question.isAdaptive,
            Question.status,
            Question.created_at,
            Question.updated_at,
            func.array_agg(func.distinct(Topic.name))
            .filter(sql(Topic.name).is_not(None))
            .label("topics"),
            func.array_agg(func.distinct(QuestionType.name))
            .filter(sql(QuestionType.name).is_not(None))
            .label("question_type"),
        )
        .outerjoin(QuestionTopicLink, Question.id == QuestionTopicLink.question_id)
        .outerjoin(Topic, Topic.id == QuestionTopicLink.topic_id)
        .outerjoin(QuestionQTypeLink, Question.id == QuestionQTypeLink.question_id)
        .outerjoin(QuestionType, QuestionType.id == QuestionQTypeLink.qtype_id)
        .group_by(
            Question.id,
            Question.title,
            Question.isAdaptive,
            Question.status,
            Question.created_at,
            Question.updated_at,
        )
    )

    return stmt.subquery("question_table")


class SharedQuestionTableRow(QuestionTableRow):
    access_level: AccessLevel | str
    granted_by_id: UUID | None
    granted_by_email: str | None = None
    shared_at: datetime


class DeveloperSharedQuestionTables:
    def __init__(self, table_service: TableQueryService) -> None:
        self._table_service = table_service

    def search_shared_with_me(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[SharedQuestionTableRow]:
        assert dev.id
        return self._table_service.search(
            params=params,
            source=SharedWithMeQuestionTableSource(dev.id),
            row_model=SharedQuestionTableRow,
        )

    def search_shared_by_me(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[SharedQuestionTableRow]:
        assert dev.id
        return self._table_service.search(
            params=params,
            source=SharedByMeQuestionTableSource(dev.id),
            row_model=SharedQuestionTableRow,
        )


class SharedByMeQuestionTableRow(BaseModel):
    question_id: UUID
    title: str
    isAdaptive: bool
    status: str
    topics: list[str | None] | None = None
    question_type: list[QType | str | None] | None = None
    access_level: AccessLevel | str
    shared_at: datetime
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DeveloperSharedQuestionTablesModel:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_shared_by_me(
        self,
        dev: DeveloperProfile,
    ) -> Sequence[SharedByMeQuestionTableRow]:
        assert dev.id

        question_table = question_table_base_subquery()

        stmt = (
            select(
                question_table,
                sql(QuestionAccess.access_level).label("access_level"),
                sql(QuestionAccess.created_at).label("shared_at"),
            )
            .join(
                QuestionAccess,
                QuestionAccess.question_id == question_table.c.question_id,
            )
            .where(
                QuestionAccess.granted_by_id == dev.id,
                QuestionAccess.access_level != "OWNER",
            )
        )

        rows = self._session.execute(stmt).mappings().all()
        return [SharedByMeQuestionTableRow.model_validate(dict(row)) for row in rows]


if __name__ == "__main__":
    from sqlmodel import Session
    from tabulate import tabulate

    from backend.database.config import engine

    uid = "e6b414b5-f85d-4908-bf22-1c46d3cf4143"
    developer_profile_id = UUID("e6646e6e-4c0d-4105-89e6-7fffd81c9d26")

    with Session(engine, expire_on_commit=False) as session:
        dev = session.get(DeveloperProfile, developer_profile_id)

        if dev is None:
            raise ValueError(f"No developer profile found for {developer_profile_id}")

        table_model = DeveloperSharedQuestionTablesModel(session)
        rows = table_model.get_shared_by_me(dev)

        print(
            tabulate(
                [
                    {
                        "question_id": row.question_id,
                        "title": row.title,
                        "isAdaptive": row.isAdaptive,
                        "status": row.status,
                        "topics": ", ".join(str(t) for t in (row.topics or [])),
                        "question_type": ", ".join(
                            str(t) for t in (row.question_type or [])
                        ),
                        "access_level": row.access_level,
                        "shared_at": row.shared_at,
                        "created_at": row.created_at,
                        "updated_at": row.updated_at,
                    }
                    for row in rows
                ],
                headers="keys",
                tablefmt="rounded_grid",
            )
        )
