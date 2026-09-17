from collections.abc import Sequence
from enum import StrEnum

from sqlalchemy import select
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.question import QuestionQTypeLink, QuestionTopicLink, QuestionType, Topic
from backend.question.views.schema import QuestionSearchParamsBase
from backend.question_runtime.model import QuestionRunTime
from backend.tables import FilterBuilder


class QuestionTableFilterBuilder(FilterBuilder[QuestionSearchParamsBase]):
    def __init__(self, params: QuestionSearchParamsBase) -> None:
        super().__init__(params)

    def build(self, subquery: Subquery) -> list[ColumnElement[bool]]:
        self.add_question_id(subquery)
        self.add_title(subquery)
        self.add_status(subquery)
        self.add_topic(subquery)
        self.add_is_adaptive(subquery)
        self.add_qtype(subquery)
        self.add_language(subquery)
        return self.filters

    def add_question_id(self, subquery: Subquery) -> None:
        if not self.params.question_id:
            return

        self.filters.append(subquery.c.question_id == self.params.question_id)

    def add_title(self, subquery: Subquery) -> None:
        if not self.params.search:
            return

        self.filters.append(subquery.c.title.ilike(f"%{self.params.search}%"))

    def add_status(self, subquery: Subquery) -> None:
        if not self.params.status:
            return

        self.filters.append(subquery.c.status == self.params.status.name)

    def add_topic(self, subquery: Subquery) -> None:
        topic = self.params.topic.strip() if self.params.topic else None
        if not topic:
            return

        topic_match = (
            select(1)
            .select_from(QuestionTopicLink)
            .join(Topic, col(Topic.id) == col(QuestionTopicLink.topic_id))
            .where(col(QuestionTopicLink.question_id) == subquery.c.question_id)
            .where(col(Topic.name).ilike(f"%{topic}%"))
            .exists()
        )

        self.filters.append(topic_match)

    def add_is_adaptive(self, subquery: Subquery) -> None:
        if self.params.isAdaptive is None:
            return

        self.filters.append(subquery.c.isAdaptive == self.params.isAdaptive)

    def add_qtype(self, subquery: Subquery) -> None:
        qtypes = self._enum_names(self.params.qtype)
        if not qtypes:
            return

        qtype_match = (
            select(1)
            .select_from(QuestionQTypeLink)
            .join(
                QuestionType,
                col(QuestionType.id) == col(QuestionQTypeLink.qtype_id),
            )
            .where(col(QuestionQTypeLink.question_id) == subquery.c.question_id)
            .where(col(QuestionType.name).in_(qtypes))
            .exists()
        )

        self.filters.append(qtype_match)

    def add_language(self, subquery: Subquery) -> None:
        languages = self._enum_names(self.params.language)
        if not languages:
            return

        runtime_match = (
            select(1)
            .select_from(QuestionRunTime)
            .where(col(QuestionRunTime.question_id) == subquery.c.question_id)
            .where(col(QuestionRunTime.enabled))
            .where(col(QuestionRunTime.language).in_(languages))
            .exists()
        )

        self.filters.append(runtime_match)

    @staticmethod
    def _enum_names(value: StrEnum | Sequence[StrEnum] | None) -> list[str]:
        if value is None:
            return []

        values = (
            value
            if isinstance(value, Sequence) and not isinstance(value, str)
            else [value]
        )
        return [str(item.name).lower() for item in values]
