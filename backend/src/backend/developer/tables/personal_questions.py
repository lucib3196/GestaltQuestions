from collections.abc import Sequence
from uuid import UUID

from backend.developer.model import DeveloperProfile
from backend.question.views.schema import QuestionSearchParams, QuestionTableRow
from backend.question.views.services.table_query_service import TableQueryService

from .sources import DeveloperQuestionTableSource


class DeveloperPersonalQuestionTables:
    def __init__(self, table_service: TableQueryService) -> None:
        self._table_service = table_service

    def search_my_questions(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[QuestionTableRow]:
        assert dev.id
        return self._table_service.search(
            params=params,
            source=DeveloperQuestionTableSource(dev.id),
        )

    def get_questions_by_collection(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
        *,
        collection_id: UUID | None = None,
        collection_title: str | None = None,
    ) -> Sequence[QuestionTableRow]:
        assert dev.id

        params = params or QuestionSearchParams()
        collection_id = collection_id or params.collection_id
        collection_title = collection_title or params.collection_title

        if collection_id is None and collection_title is None:
            raise ValueError("collection_id or collection_title is required")

        params = params.model_copy(
            update={
                "collection_id": collection_id,
                "collection_title": collection_title,
            }
        )
        return self._table_service.search(
            params=params,
            source=DeveloperQuestionTableSource(dev.id),
        )
