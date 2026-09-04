from collections.abc import Sequence

from sqlalchemy import String, cast, func, select
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.question import (
    Question,
    QuestionQTypeLink,
    QuestionTopicLink,
    QuestionType,
    Topic,
)
from backend.question.views.schema import QuestionSearchParamsBase
from backend.question_runtime.model import QuestionRunTime
from backend.tables import TableExtension, TableQueryComposer

from .question_table_filters import QuestionTableFilterBuilder


class QuestionTableQueryComposer(TableQueryComposer[QuestionSearchParamsBase]):
    """Builds question table SQL statements without executing them."""

    def __init__(
        self,
        extensions: Sequence[TableExtension] | None = None,
        *,
        dialect_name: str,
    ) -> None:
        super().__init__(
            search_params_model=QuestionSearchParamsBase,
            filter_builder=QuestionTableFilterBuilder,
            extensions=extensions,
            dialect_name=dialect_name,
        )

    def build_base_subquery(self, table_name: str = "question_table") -> Subquery:
        """Build the reusable base question table subquery."""
        topics = func.array_agg(func.distinct(Topic.name)).label("topics")

        question_type = cast(
            func.array_agg(func.distinct(QuestionType.name)),
            ARRAY(String),
        ).label("question_type")

        available_runtimes = func.array_remove(
            cast(
                func.array_agg(func.distinct(QuestionRunTime.language)), ARRAY(String)
            ),
            None,
        ).label("available_runtimes")

        if self._dialect_name == "sqlite":
            topics = func.json_group_array(func.distinct(Topic.name)).label("topics")
            question_type = func.json_group_array(
                func.distinct(QuestionType.name)
            ).label("question_type")
            available_runtimes = func.json_group_array(
                func.distinct(QuestionRunTime.language)
            ).label("available_runtimes")

        stmt = (
            select(
                col(Question.id).label("question_id"),
                col(Question.title),
                col(Question.isAdaptive),
                col(Question.status),
                col(Question.created_at),
                col(Question.created_by_id),
                col(Question.updated_at),
                topics,
                question_type,
                available_runtimes,
            )
            .join(
                QuestionTopicLink,
                col(Question.id) == col(QuestionTopicLink.question_id),
            )
            .join(Topic, col(Topic.id) == col(QuestionTopicLink.topic_id))
            .join(
                QuestionQTypeLink,
                col(Question.id) == col(QuestionQTypeLink.question_id),
            )
            .join(QuestionType, col(QuestionType.id) == col(QuestionQTypeLink.qtype_id))
            .outerjoin(
                QuestionRunTime,
                (col(QuestionRunTime.question_id) == col(Question.id))
                & col(QuestionRunTime.enabled),
            )
            .group_by(
                col(Question.id),
                col(Question.title),
                col(Question.isAdaptive),
                col(Question.status),
                col(Question.created_at),
                col(Question.created_by_id),
                col(Question.updated_at),
            )
        )
        return stmt.subquery(table_name)

    def apply_ordering(
        self, stmt: Select, params: QuestionSearchParamsBase, table: Subquery
    ) -> Select:
        return stmt.order_by(
            table.c.updated_at.desc().nulls_last(),
            table.c.created_at.desc(),
        )
