from uuid import UUID

from sqlalchemy import func, select as select_alc
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import select

from backend.question import (
    Question,
    QuestionQTypeLink,
    QuestionTopicLink,
    QuestionType,
    Topic,
)
from backend.question.views.schema import QuestionSearchParamsBase
from backend.question_runtime.model import QuestionRunTime

from .question_table_filters import QuestionTableFilterBuilder


class QuestionTableQuery:
    def base(self, table_name: str = "question_table") -> Subquery:
        stmt = (
            select(
                Question.id.label(  # pyright: ignore[reportAttributeAccessIssue] # type: ignore
                    "question_id"
                ),
                Question.title,
                Question.isAdaptive,
                Question.status,
                Question.created_at,
                Question.updated_at,
                func.array_agg(func.distinct(Topic.name)).label("topics"),
                func.array_agg(func.distinct(QuestionType.name)).label("question_type"),
                func.array_remove(
                    func.array_agg(func.distinct(QuestionRunTime.language)),
                    None,
                ).label("available_runtimes"),
            )  # pyright: ignore[reportCallIssue]
            .join(QuestionTopicLink, Question.id == QuestionTopicLink.question_id)
            .join(Topic, Topic.id == QuestionTopicLink.topic_id)
            .join(QuestionQTypeLink, Question.id == QuestionQTypeLink.question_id)
            .join(QuestionType, QuestionType.id == QuestionQTypeLink.qtype_id)
            .join(
                QuestionRunTime,
                (QuestionRunTime.question_id == Question.id)
                & (QuestionRunTime.enabled),
            )
            .group_by(
                Question.id,
                Question.title,
                Question.isAdaptive,
                Question.status,
                Question.created_at,
                Question.updated_at,
            )
        )
        return stmt.subquery(table_name)

    def search(self, params: QuestionSearchParamsBase | None = None):
        params = params or QuestionSearchParamsBase()
        question_table = self.base()
        filters = QuestionTableFilterBuilder(params).build(question_table)

        return (
            select_alc(question_table)
            .where(*filters)
            .order_by(
                question_table.c.updated_at.desc().nulls_last(),
                question_table.c.created_at.desc(),
            )
            .limit(params.limit)
            .offset(params.offset)
        )

    def by_id(self, qid: UUID):
        question_table = self.base()
        return select_alc(question_table).where(question_table.c.question_id == qid)
