from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import Generic

from sqlalchemy import select
from sqlalchemy.sql import Select, Subquery

from .exceptions import TableFilterBuildError, TableQueryBuildError
from .extension import TableExtension
from .types import SearchParams
from .filter_builder import FilterBuilder


class TableQueryComposer(ABC, Generic[SearchParams]):

    def __init__(
        self,
        search_params_model: type[SearchParams],
        filter_builder: type[FilterBuilder[SearchParams]],
        extensions: Sequence[TableExtension] | None = None,
        *,
        dialect_name: str,
    ) -> None:
        self._search_params_model = search_params_model
        self._dialect_name = dialect_name
        self._filter_builder = filter_builder
        self._extensions = list(extensions or [])

    @abstractmethod
    def build_base_subquery(self, table_name: str = "table") -> Subquery:
        """Build the reusable table-shaped subquery for this table."""
        raise NotImplementedError

    def search(self, params: SearchParams | None = None) -> Select:
        """Build the full search query from base table, extensions, filters, and hooks."""
        params = params or self._search_params_model()

        try:
            table = self.build_base_subquery()
            stmt = select(table).select_from(table)

            for extension in self._extensions:
                stmt = extension.apply(stmt, table)

            filters = self.build_filters(params, table)
            stmt = stmt.where(*filters)

            stmt = self.apply_ordering(stmt, params, table)
            return self.apply_pagination(stmt, params)

        except TableFilterBuildError:
            raise
        except Exception as e:
            raise TableQueryBuildError(f"Failed to build table search query: {e}") from e

    def build_filters(self, params: SearchParams, table: Subquery):
        """Build filters for the current search params."""
        try:
            return self._filter_builder(params).build(table)
        except Exception as e:
            raise TableFilterBuildError(f"Failed to build table filters: {e}") from e

    def apply_ordering(
        self,
        stmt: Select,
        params: SearchParams,
        table: Subquery,
    ) -> Select:
        """Override in subclasses to add table-specific ordering."""
        return stmt

    def apply_pagination(
        self,
        stmt: Select,
        params: SearchParams,
    ) -> Select:
        """Apply limit and offset when the search params expose them."""
        limit = getattr(params, "limit", None)
        offset = getattr(params, "offset", None)

        if limit is not None:
            stmt = stmt.limit(limit)

        if offset is not None:
            stmt = stmt.offset(offset)

        return stmt

    @property
    def keys(self) -> list[str]:
        """Return the column keys exposed by the base subquery."""
        return list(self.build_base_subquery().c.keys())

    @property
    def dialect(self) -> str:
        return self._dialect_name
