from collections.abc import Sequence
from typing import cast

from backend.developer.model import DeveloperProfile
from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions import PublishedQuestionTableExtension
from backend.question.views.schema import QuestionSearchParams, QuestionTableRowBase
from backend.question.views.services import QuestionTable


class DeveloperPersonalQuestionTables(DeveloperTables):
    """Builds personal developer question and collection tables."""

    def search_my_questions(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[QuestionTableRowBase]:
        """Return questions created by the provided developer."""
        assert dev.id

        table = QuestionTable(
            self._session,
            extensions=[
                PublishedQuestionTableExtension(),
            ],
            row_model=QuestionTableRowBase,
        )

        return cast(Sequence[QuestionTableRowBase], table.search(params))
