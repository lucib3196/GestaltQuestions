from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Any, Protocol


@dataclass(frozen=True)
class TableQuerySource:
    from_sql: str
    select_sql: str = "table_view.*"
    where_clauses: Sequence[str] = field(default_factory=tuple)
    params: dict[str, Any] = field(default_factory=dict)


class QuestionTableSourceBuilder(Protocol):
    def build(self, view_name: str) -> TableQuerySource: ...


class BaseQuestionTableSource:
    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(from_sql=f"{view_name} table_view")
