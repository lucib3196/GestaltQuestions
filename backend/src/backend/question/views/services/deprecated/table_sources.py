from collections.abc import Sequence
from typing import Any, Protocol

from pydantic import BaseModel, Field


class TableQuerySource(BaseModel):
    from_sql: str
    select_sql: str = "table_view.*"
    where_clauses: Sequence[str] = Field(default_factory=tuple)
    params: dict[str, Any] = Field(default_factory=dict)


class QuestionTableSourceBuilder(Protocol):
    def build(self, view_name: str) -> TableQuerySource: ...


class BaseQuestionTableSource:
    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(from_sql=f"{view_name} table_view")
