from collections.abc import Sequence
from typing import cast

from backend.developer.model import DeveloperProfile
from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions import (
    DeveloperQuestionTableExtension,
    PublishedQuestionTableExtension,
    QuestionCollectionExtension,
)
from backend.developer.tables.schemas import (
    PersonalQuestionTableRow,
    PublishedQuestionTableRow,
)
from backend.question.views.schema import QuestionSearchParams
from backend.question.views.services import QuestionTable


class DeveloperPersonalQuestionTables(DeveloperTables):
    """Builds personal developer question and collection tables."""

    def search_my_questions(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[PersonalQuestionTableRow]:
        """Return questions created by the provided developer."""
        assert dev.id

        table = QuestionTable(
            self._session,
            extensions=[
                DeveloperQuestionTableExtension(dev.id),
            ],
            row_model=PersonalQuestionTableRow,
        )

        return cast(Sequence[PersonalQuestionTableRow], table.search(params))

    def search_my_published_questions(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[PublishedQuestionTableRow]:
        """Return published questions created by the provided developer."""
        assert dev.id

        table = QuestionTable(
            self._session,
            extensions=[
                DeveloperQuestionTableExtension(dev.id),
                PublishedQuestionTableExtension(),
            ],
            row_model=PublishedQuestionTableRow,
        )

        return cast(Sequence[PublishedQuestionTableRow], table.search(params))

    def search_questions_in_collections(
        self, dev: DeveloperProfile, params: QuestionSearchParams
    ) -> Sequence[PersonalQuestionTableRow]:
        # Default if no collection id is present
        if not params.collection_id:
            return self.search_my_questions(dev, params)

        table = QuestionTable(
            self._session,
            extensions=[
                DeveloperQuestionTableExtension(dev.id),
                QuestionCollectionExtension(collection_id=params.collection_id),
            ],
            row_model=PersonalQuestionTableRow,
        )
        return cast(Sequence[PersonalQuestionTableRow], table.search(params))
