from collections.abc import Sequence
from datetime import datetime
from typing import cast

from backend.authorization import AccessLevel
from backend.developer.model import DeveloperProfile
from backend.developer.tables.extensions import (
    SharedByMeQuestionTableExtension,
    SharedWithMeQuestionTableExtension,
)
from uuid import UUID
from backend.developer.tables.extensions.question_access import (
    QuestionAccessTableExtension,
)
from backend.question.views.schema import QuestionSearchParams, QuestionTableRowBase
from backend.question.views.services import QuestionTable
from typing import List
from .base import DeveloperTables


class SharedWithMeQuestionTableRow(QuestionTableRowBase):
    """Row returned by the shared-with-me question table."""

    access_levels: list[AccessLevel | str]
    granted_by_email: str
    granted_to_emails: List[str]
    shared_at: datetime


class SharedByMeQuestionTableRow(QuestionTableRowBase):
    access_levels: list[AccessLevel | str]
    granted_by_email: str | None
    granted_to_emails: list[str | None]
    member_ids: list[UUID | None]
    shared_at: datetime | None


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
                QuestionAccessTableExtension(granted_to_id=dev.id),
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
                QuestionAccessTableExtension(granted_by_id=dev.id),
            ],
            row_model=SharedByMeQuestionTableRow,
        )

        return cast(Sequence[SharedByMeQuestionTableRow], table.search(params))
