from collections.abc import Sequence
from enum import StrEnum

from sqlalchemy import func, select
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Subquery

from backend.question.views.schema import QuestionSearchParamsBase
from backend.tables import FilterBuilder


class QuestionTableFilterBuilder(FilterBuilder[QuestionSearchParamsBase]):
    def __init__(self, params: QuestionSearchParamsBase) -> None:
        self.params = params
        self.filters: list[ColumnElement[bool]] = []

    def build(self, subquery: Subquery) -> list[ColumnElement[bool]]:
        self.add_title(subquery)
        self.add_status(subquery)
        self.add_topic(subquery)
        self.add_is_adaptive(subquery)
        self.add_qtype(subquery)
        self.add_language(subquery)
        return self.filters

    def add_title(self, subquery: Subquery) -> None:
        if not self.params.search:
            return

        self.filters.append(subquery.c.title.ilike(f"%{self.params.search}%"))

    def add_status(self, subquery: Subquery) -> None:
        if not self.params.status:
            return

        self.filters.append(subquery.c.status == self.params.status.name)

    def add_topic(self, subquery: Subquery) -> None:
        if not self.params.topic:
            return

        topics = select(func.unnest(subquery.c.topics).label("topic")).subquery()
        self.filters.append(
            select(1)
            .select_from(topics)
            .where(topics.c.topic.ilike(f"%{self.params.topic}%"))
            .exists()
        )

    def add_is_adaptive(self, subquery: Subquery) -> None:
        if self.params.isAdaptive is None:
            return

        self.filters.append(subquery.c.isAdaptive == self.params.isAdaptive)

    def add_qtype(self, subquery: Subquery) -> None:
        qtypes = self._enum_names(self.params.qtype)
        if not qtypes:
            return

        self.filters.append(subquery.c.question_type.overlap(qtypes))

    def add_language(self, subquery: Subquery) -> None:
        languages = self._enum_names(self.params.language)
        if not languages:
            return

        self.filters.append(subquery.c.available_runtimes.overlap(languages))

    @staticmethod
    def _enum_names(value: StrEnum | Sequence[StrEnum] | None) -> list[str]:
        if value is None:
            return []

        values = (
            value
            if isinstance(value, Sequence) and not isinstance(value, str)
            else [value]
        )
        return [item.name for item in values]
