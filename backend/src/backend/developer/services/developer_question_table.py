from collections.abc import Sequence

from backend.developer import DeveloperProfile
from backend.question_views.schema import (
    QuestionSearchParams,
    QuestionTableRow,
    QuestionTableSearchContext,
)
from backend.question_views.service.table_query_service import TableQueryService


class DeveloperTables:
    def __init__(self, table_service: TableQueryService) -> None:
        self._table_service = table_service

    def search_my_questions(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[QuestionTableRow]:
        assert dev.id
        context = QuestionTableSearchContext(developer_profile_id=dev.id)
        return self._table_service.search(params=params, context=context)
