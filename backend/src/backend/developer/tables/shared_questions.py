from collections.abc import Sequence
from typing import cast

from backend.developer.model import DeveloperProfile
from backend.developer.tables.extensions import (
    SharedByMeQuestionTableExtension,
    SharedWithMeQuestionTableExtension,
)
from backend.question.views.schema import QuestionSearchParams, QuestionTableRowBase
from backend.question.views.services import QuestionTable, QuestionTableQueryComposer

from .base import DeveloperTables


class SharedWithMeQuestionTableRow(QuestionTableRowBase):
    """Row returned by the shared-with-me question table."""


class SharedByMeQuestionTableRow(QuestionTableRowBase):
    """Row returned by the shared-by-me question table."""


SharedQuestionTableRow = SharedWithMeQuestionTableRow


class DeveloperSharedQuestionTables(DeveloperTables):
    """Builds shared developer question tables."""

    def search_shared_with_me(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[SharedWithMeQuestionTableRow]:
        """Return questions shared with the provided developer."""
        assert dev.id

        composer = QuestionTableQueryComposer(
            self._session,
            extensions=[
                SharedWithMeQuestionTableExtension(dev.id),
            ],
        )
        table = QuestionTable(
            self._session,
            composer=composer,
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

        composer = QuestionTableQueryComposer(
            self._session,
            extensions=[
                SharedByMeQuestionTableExtension(dev.id),
            ],
        )
        table = QuestionTable(
            self._session,
            composer=composer,
            row_model=SharedByMeQuestionTableRow,
        )

        return cast(Sequence[SharedByMeQuestionTableRow], table.search(params))
