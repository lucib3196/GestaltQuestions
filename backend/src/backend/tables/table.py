from collections.abc import Sequence
from typing import Any, Generic

from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import Select
from sqlmodel import Session

from .composer import TableQueryComposer
from .exceptions import TableExecutionError, TableRowValidationError
from .types import RowModel, SearchParams


class Table(Generic[RowModel, SearchParams]):
    def __init__(
        self,
        session: Session,
        row_model: type[RowModel],
        composer: TableQueryComposer[SearchParams],
    ) -> None:
        """Initialize the table service with a session, composer, and row model."""
        self._session = session
        self._composer = composer
        self._row_model = row_model

    def search(self, params: SearchParams | None = None) -> Sequence[RowModel]:
        """Build, execute, and validate a table search query."""
        search = self._composer.search(params)
        return self.execute(search)

    def execute(self, stmt: Select[Any]) -> Sequence[RowModel]:
        """Execute a statement and validate each mapping with the row model."""
        try:
            rows = self._session.execute(stmt).mappings().all()

        except SQLAlchemyError as e:
            raise TableExecutionError(f"Failed to execute table query: {e}") from e

        try:
            return [self._row_model.model_validate(row) for row in rows]
        except ValidationError as e:
            raise TableRowValidationError(
                f"Failed to validate table rows with {self._row_model.__name__}: {e}"
            ) from e
