from backend.tables import TableExtension

from .deprecated import (
    BaseQuestionTableSource,
    DeprecatedQuestionTableFilterBuilder,
    QuestionTableSourceBuilder,
    TableQueryService,
    TableQuerySource,
)
from .tables import (
    QuestionTable,
    QuestionTableFilterBuilder,
    QuestionTableQueryComposer,
)

QuestionTableExtension = TableExtension

__all__ = [
    "BaseQuestionTableSource",
    "DeprecatedQuestionTableFilterBuilder",
    "QuestionTable",
    "QuestionTableExtension",
    "QuestionTableFilterBuilder",
    "QuestionTableQueryComposer",
    "QuestionTableSourceBuilder",
    "TableQueryService",
    "TableQuerySource",
]
