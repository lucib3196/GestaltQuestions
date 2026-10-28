from collections.abc import Sequence
from uuid import UUID

from sqlmodel import Session

from backend.question.views.schema import QuestionSearchParamsBase, QuestionTableRowBase
from backend.tables import Table, TableExtension

from .question_table_composer import QuestionTableQueryComposer
from backend.tables import TableExtension, TableQueryComposer


class QuestionTable(Table[QuestionTableRowBase, QuestionSearchParamsBase]):
    """Executes question queries and validates response rows."""

    def __init__(
        self,
        session: Session,
        *,
        composer: TableQueryComposer[QuestionSearchParamsBase] | None = None,
        row_model: type[QuestionTableRowBase] = QuestionTableRowBase,
        extensions: Sequence[TableExtension] = []
    ) -> None:
        if composer is None:
            composer = QuestionTableQueryComposer(
                dialect_name=session.get_bind().dialect.name,
                search_model=QuestionSearchParamsBase,
                extensions=extensions
            )

        super().__init__(
            session=session,
            row_model=row_model,
            composer=composer,
        )

    def search_by_id(self, question_id: UUID) -> Sequence[QuestionTableRowBase]:
        """Return the table row for a single question id."""
        return self.search(QuestionSearchParamsBase(question_id=question_id))
