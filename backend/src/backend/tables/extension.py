from abc import ABC, abstractmethod
from sqlalchemy.sql import Select, Subquery


class TableExtension(ABC):
    """Adds query-specific behavior on top of the base subquery."""

    @abstractmethod
    def apply(self, stmt: Select, subquery: Subquery) -> Select:
        """Return a modified statement using the current statement and subquery."""

        raise NotImplementedError
