class TableError(Exception):
    """Base exception for generic table query and execution errors."""


class TableQueryBuildError(TableError):
    """Raised when a table query cannot be composed."""


class TableFilterBuildError(TableError):
    """Raised when table filters cannot be built from search params."""


class TableExecutionError(TableError):
    """Raised when a table query cannot be executed."""


class TableRowValidationError(TableError):
    """Raised when query rows cannot be validated against the row model."""
