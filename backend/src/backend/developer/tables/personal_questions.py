from collections.abc import Sequence
from datetime import datetime
from typing import cast
from uuid import UUID

from pydantic import BaseModel

from backend.developer.model import DeveloperProfile
from backend.developer.tables.base import DeveloperTables
from backend.developer.tables.extensions import (
    DeveloperQuestionTableExtension,
    PublishedQuestionTableExtension,
)
from backend.question.views.schema import QuestionSearchParams, QuestionTableRowBase
from backend.question.views.services import QuestionTable, QuestionTableQueryComposer


class PersonalQuestionTableRow(QuestionTableRowBase):
    """Row returned by the personal question table."""


class PublishedQuestionTableRow(QuestionTableRowBase):
    """Row returned by the published personal question table."""


class PersonalCollectionTableRow(BaseModel):
    """Row returned by the personal collection table."""

    id: UUID | None
    owner_id: UUID | None
    title: str
    parent_id: UUID | None
    question_count: int
    created_at: datetime
    updated_at: datetime


class DeveloperPersonalQuestionTables(DeveloperTables):
    """Builds personal developer question and collection tables."""

    def search_my_questions(
        self,
        dev: DeveloperProfile,
        params: QuestionSearchParams | None = None,
    ) -> Sequence[PersonalQuestionTableRow]:
        """Return questions created by the provided developer."""
        assert dev.id

        composer = QuestionTableQueryComposer(
            self._session,
            extensions=[
                DeveloperQuestionTableExtension(dev.id),
            ],
        )
        table = QuestionTable(
            self._session,
            composer=composer,
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

        composer = QuestionTableQueryComposer(
            self._session,
            extensions=[
                DeveloperQuestionTableExtension(dev.id),
                PublishedQuestionTableExtension(),
            ],
        )
        table = QuestionTable(
            self._session,
            composer=composer,
            row_model=PublishedQuestionTableRow,
        )

        return cast(Sequence[PublishedQuestionTableRow], table.search(params))

    # def get_questions_by_collection(
    #     self,
    #     dev: DeveloperProfile,
    #     params: QuestionSearchParams | None = None,
    #     *,
    #     collection_id: UUID | None = None,
    #     collection_title: str | None = None,
    # ) -> Sequence[PersonalQuestionTableRow]:
    #     """Return owned questions filtered by collection id or title."""
    #     assert dev.id

    #     params = params or QuestionSearchParams()
    #     collection_id = collection_id or params.collection_id
    #     collection_title = collection_title or params.collection_title

    #     if collection_id is None and collection_title is None:
    #         raise ValueError("collection_id or collection_title is required")

    #     params = params.model_copy(
    #         update={
    #             "collection_id": collection_id,
    #             "collection_title": collection_title,
    #         }
    #     )
    #     composer = QuestionTableQueryComposer(
    #         self._session,
    #         extensions=[
    #             DeveloperQuestionTableExtension(dev.id),
    #             PersonalQuestionCollectionExtension(
    #                 collection_id=collection_id,
    #                 collection_title=collection_title,
    #             ),
    #         ],
    #     )
    #     table = QuestionTable(
    #         self._session,
    #         composer=composer,
    #         row_model=PersonalQuestionTableRow,
    #     )

    #     return cast(Sequence[PersonalQuestionTableRow], table.search(params))

    # def search_my_collections(
    #     self,
    #     dev: DeveloperProfile,
    # ) -> Sequence[PersonalCollectionTableRow]:
    #     """Return collections owned by the provided developer."""
    #     assert dev.id

    #     composer = PersonalCollectionTableComposer(dev.id)
    #     rows = self._session.execute(composer.search()).mappings().all()

    #     return [PersonalCollectionTableRow.model_validate(row) for row in rows]
