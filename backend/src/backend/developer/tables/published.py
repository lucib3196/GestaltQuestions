from collections.abc import Sequence

from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions import (
    PublishedQuestionTableExtension,
    CreatedByTableExtension,
)
from collections.abc import Sequence
from uuid import UUID


from backend.question.views.schema import QuestionSearchParamsBase, QuestionTableRowBase
from backend.tables import Table, TableExtension


from backend.tables import TableExtension

from backend.question.views.schema import (
    QuestionSearchParamsBase,
    QuestionTableRowBase,
)
from uuid import UUID
from backend.question.views.services.tables import QuestionTableQueryComposer
from sqlalchemy import Subquery
from backend.tables import TableExtension
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col
from backend.tables import Table
from backend.accounts.model import Institution, User
from backend.question.views.services.tables.question_table_filters import (
    QuestionTableFilterBuilder,
)
from backend.accounts.schemas import ValidInstitutions


class PublishedQuestionRow(QuestionTableRowBase):
    created_by_email: str | None
    user_id: UUID | str
    institution: str


class PublishedQuestionSearch(QuestionSearchParamsBase):
    institution: ValidInstitutions | None = None
    created_by_email: str | None = None


class PublishedQuestionFilterBuilder(
    QuestionTableFilterBuilder[PublishedQuestionSearch]
):
    def build(self, subquery: Subquery) -> list[ColumnElement[bool]]:
        super().build(subquery)
        self.add_institution(subquery)
        self.add_created_by_email(subquery)
        return self.filters

    def add_institution(self, subquery: Subquery) -> None:

        if self.params.institution is not None:
            self.filters.append(col(subquery.c.institution) == self.params.institution)
        return None

    def add_created_by_email(self, subquery: Subquery) -> None:
        email = (self.params.created_by_email or "").strip()
        if email:
            self.filters.append(col(subquery.c.created_by_email).ilike(f"%{email}%"))


class PublishedQueryComposer(QuestionTableQueryComposer[PublishedQuestionSearch]):
    def __init__(
        self,
        *,
        dialect_name: str,
    ) -> None:
        super().__init__(
            extensions=[
                PublishedQuestionTableExtension(),
                CreatedByTableExtension(),
            ],
            dialect_name=dialect_name,
            filter_builder=PublishedQuestionFilterBuilder,
            search_model=PublishedQuestionSearch,
        )


class DeveloperPublishedQuestionTables(DeveloperTables):
    """Search published questions with creator and institution filters."""

    def _construct_table(
        self,
    ) -> Table[PublishedQuestionRow, PublishedQuestionSearch]:
        return Table(
            session=self._session,
            row_model=PublishedQuestionRow,
            composer=PublishedQueryComposer(
                dialect_name=self._session.get_bind().dialect.name,
            ),
        )

    def search_published_questions(
        self,
        params: PublishedQuestionSearch | None = None,
    ) -> Sequence[PublishedQuestionRow]:
        return self._construct_table().search(params)
