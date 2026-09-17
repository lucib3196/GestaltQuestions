from collections.abc import Sequence
from typing import cast

from pydantic import BaseModel, ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import aliased
from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.developer import DeveloperProfile
from backend.developer.tables.extensions.collection_access import (
    CollectionAccessTableExtension,
)
from backend.developer.tables.schemas import (
    SharedByMeCollectionTableRow,
    SharedWithMeCollectionTableRow,
)
from backend.question.collections import QuestionCollection, QuestionCollectionLink
from backend.tables import TableExtension
from backend.tables.exceptions import TableExecutionError, TableRowValidationError

from .base import DeveloperTables


class CollectionSearchParams(BaseModel):
    collection_id: str | None
    search: str
    offset: int
    limit: int


class DeveloperSharedCollectionTables(DeveloperTables):
    """Builds shared developer collection tables."""

    def search_shared_with_me(
        self,
        dev: DeveloperProfile,
        params: CollectionSearchParams | None = None,
    ) -> Sequence[SharedWithMeCollectionTableRow]:
        assert dev.id

        stmt = self._shared_collection_stmt(
            CollectionAccessTableExtension(
                granted_to_id=dev.id,
                dialect_name=self._session.get_bind().dialect.name,
            ),
            params,
        )

        return cast(
            Sequence[SharedWithMeCollectionTableRow],
            self._execute(stmt, SharedWithMeCollectionTableRow),
        )

    def search_shared_by_me(
        self,
        dev: DeveloperProfile,
        params: CollectionSearchParams | None = None,
    ) -> Sequence[SharedByMeCollectionTableRow]:
        assert dev.id

        stmt = self._shared_collection_stmt(
            CollectionAccessTableExtension(
                granted_by_id=dev.id,
                dialect_name=self._session.get_bind().dialect.name,
            ),
            params,
        )

        return cast(
            Sequence[SharedByMeCollectionTableRow],
            self._execute(stmt, SharedByMeCollectionTableRow),
        )

    def _shared_collection_stmt(
        self,
        access_extension: TableExtension,
        params: CollectionSearchParams | None,
    ) -> Select:
        params = params or CollectionSearchParams()
        table = self._collection_table_subquery()
        stmt = select(table).select_from(table)
        stmt = access_extension.apply(stmt, table)

        if params.collection_id is not None:
            stmt = stmt.where(table.c.id == params.collection_id)

        if params.search:
            stmt = stmt.where(table.c.title.ilike(f"%{params.search}%"))

        stmt = stmt.order_by(
            table.c.updated_at.desc().nulls_last(),
            table.c.created_at.desc(),
        )

        if params.limit is not None:
            stmt = stmt.limit(params.limit)

        if params.offset is not None:
            stmt = stmt.offset(params.offset)

        return stmt

    def _collection_table_subquery(
        self,
        table_name: str = "collection_table",
    ) -> Subquery:
        child = aliased(QuestionCollection, name="child_collection")
        question_count = (
            select(func.count(col(QuestionCollectionLink.question_id)))
            .where(
                col(QuestionCollectionLink.collection_id) == col(QuestionCollection.id)
            )
            .scalar_subquery()
        )
        subcollections_len = (
            select(func.count(col(child.id)))
            .where(col(child.parent_id) == col(QuestionCollection.id))
            .scalar_subquery()
        )

        return (
            select(
                col(QuestionCollection.id).label("id"),
                col(QuestionCollection.owner_id),
                col(QuestionCollection.title),
                col(QuestionCollection.description),
                col(QuestionCollection.customization),
                col(QuestionCollection.status),
                col(QuestionCollection.parent_id),
                question_count.label("question_count"),
                subcollections_len.label("subcollections_len"),
                col(QuestionCollection.created_at),
                col(QuestionCollection.updated_at),
            )
            .select_from(QuestionCollection)
            .subquery(table_name)
        )

    def _execute(
        self,
        stmt: Select,
        row_model: type[SharedWithMeCollectionTableRow]
        | type[SharedByMeCollectionTableRow],
    ) -> Sequence[SharedWithMeCollectionTableRow | SharedByMeCollectionTableRow]:
        try:
            rows = self._session.execute(stmt).mappings().all()
        except SQLAlchemyError as e:
            raise TableExecutionError(f"Failed to execute table query: {e}") from e

        try:
            return [row_model.model_validate(row) for row in rows]
        except ValidationError as e:
            raise TableRowValidationError(
                f"Failed to validate table rows with {row_model.__name__}: {e}"
            ) from e
