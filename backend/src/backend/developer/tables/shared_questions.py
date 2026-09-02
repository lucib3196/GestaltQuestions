from collections.abc import Sequence
from datetime import datetime
from uuid import UUID

from backend.authorization import AccessLevel
from backend.developer.model import DeveloperProfile
from backend.developer.tables.sources import (
    SharedByMeQuestionTableSource,
    SharedWithMeQuestionTableSource,
)
from backend.question.views.schema import QuestionSearchParams, QuestionTableRow
from backend.question.views.services.table_query_service import TableQueryService


class SharedQuestionTableRow(QuestionTableRow):
    access_level: AccessLevel
    granted_by_id: UUID | None
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
