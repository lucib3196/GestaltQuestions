from abc import ABC, abstractmethod
from uuid import UUID

from sqlalchemy import String, cast, func, select as select_alc
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import Session, select

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


class QuestionTableExtension(ABC):
    """Adds query-specific behavior on top of the base question table subquery."""

    @abstractmethod
    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Return a modified statement using the current statement and subquery."""
        ...


class QuestionTableQueryComposer:
    """Builds question table SQL statements without executing them."""

    def __init__(
        self,
        session: Session,
        extensions: list[QuestionTableExtension] | None = None,
    ) -> None:
        """Initialize the composer with the session dialect and optional extension."""
        self._dialect_name = session.get_bind().dialect.name
        self._extensions = extensions or []

    def base(self, table_name: str = "question_table") -> Subquery:
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
                Question.id.label(  # pyright: ignore[reportAttributeAccessIssue] # type: ignore
                    "question_id"
                ),
                Question.title,
                Question.isAdaptive,
                Question.status,
                Question.created_at,
                Question.created_by_id,
                Question.updated_at,
                topics,
                question_type,
                available_runtimes,
            )  # pyright: ignore[reportCallIssue]
            .join(QuestionTopicLink, Question.id == QuestionTopicLink.question_id)
            .join(Topic, Topic.id == QuestionTopicLink.topic_id)
            .join(QuestionQTypeLink, Question.id == QuestionQTypeLink.question_id)
            .join(QuestionType, QuestionType.id == QuestionQTypeLink.qtype_id)
            .outerjoin(
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
                Question.created_by_id,
                Question.updated_at,
            )
        )
        return stmt.subquery(table_name)

    def search(self, params: QuestionSearchParamsBase | None = None) -> Select:
        """Build a filtered and ordered question table search statement."""
        params = params or QuestionSearchParamsBase()
        question_table = self.base()
        stmt = select_alc(question_table).select_from(question_table)

        for extension in self._extensions:
            stmt = extension.apply(stmt, question_table)

        filters = QuestionTableFilterBuilder(params).build(question_table)

        return (
            stmt.where(*filters)
            .order_by(
                question_table.c.updated_at.desc().nulls_last(),
                question_table.c.created_at.desc(),
            )
            .limit(params.limit)
            .offset(params.offset)
        )

    def by_id(self, qid: UUID) -> Select:
        """Build a statement that selects a question table row by question id."""
        question_table = self.base()
        return select_alc(question_table).where(question_table.c.question_id == qid)

    @property
    def keys(self) -> list[str]:
        """Return the column names exposed by the base question table subquery."""
        return list(self.base().c.keys())
