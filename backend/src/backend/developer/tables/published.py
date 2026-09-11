from collections.abc import Sequence
from typing import cast

from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions import PublishedQuestionTableExtension
from backend.question.views.schema import QuestionSearchParams, QuestionTableRowBase
from backend.question.views.services import QuestionTable


class DeveloperPublishedQuestionTables(DeveloperTables):
    """Builds published question tables."""

    def search_published_questions(
        self,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[QuestionTableRowBase]:
        """Return published questions."""

        table = QuestionTable(
            self._session,
            extensions=[
                PublishedQuestionTableExtension(),
            ],
            row_model=QuestionTableRowBase,
        )

        return cast(Sequence[QuestionTableRowBase], table.search(params))
