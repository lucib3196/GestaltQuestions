from abc import ABC, abstractmethod
from typing import Generic

from sqlalchemy.sql import Subquery
from sqlalchemy.sql.elements import ColumnElement

from .types import SearchParams


class FilterBuilder(ABC, Generic[SearchParams]):
    def __init__(self, params: SearchParams) -> None:
        self.params = params
        self.filters: list[ColumnElement[bool]] = []

    @abstractmethod
    def build(self, subquery: Subquery) -> list[ColumnElement[bool]]:
        """Return SQLAlchemy filters for the given table-shaped subquery."""
        raise NotImplementedError
