from collections.abc import Sequence
from typing import cast

from backend.developer.model import DeveloperProfile
from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions.question_access import (
    QuestionAccessTableExtension,
)
from backend.developer.tables.schemas import (
    SharedByMeQuestionTableRow,
    SharedWithMeQuestionTableRow,
)
from backend.question.views.schema import QuestionSearchParams
from backend.question.views.services import QuestionTable


class DeveloperSharedQuestionTables(DeveloperTables):
    """Builds shared developer question tables."""

    def search_shared_with_me(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[SharedWithMeQuestionTableRow]:
        """Return questions shared with the provided developer."""
        assert dev.id

        table = QuestionTable(
            self._session,
            extensions=[
                QuestionAccessTableExtension(
                    granted_to_id=dev.id,
                    dialect_name=self._session.get_bind().dialect.name,
                ),
            ],
            row_model=SharedWithMeQuestionTableRow,
        )

        return cast(Sequence[SharedWithMeQuestionTableRow], table.search(params))

    def search_shared_by_me(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[SharedByMeQuestionTableRow]:
        """Return questions shared by the provided developer."""
        assert dev.id

        table = QuestionTable(
            self._session,
            extensions=[
                QuestionAccessTableExtension(
                    granted_by_id=dev.id,
                    dialect_name=self._session.get_bind().dialect.name,
                ),
            ],
            row_model=SharedByMeQuestionTableRow,
        )

        return cast(Sequence[SharedByMeQuestionTableRow], table.search(params))
