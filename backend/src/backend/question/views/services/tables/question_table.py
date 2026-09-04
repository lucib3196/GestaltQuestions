from collections.abc import Sequence

from sqlmodel import Session

from backend.question.views.schema import QuestionSearchParamsBase, QuestionTableRowBase
from backend.tables import Table, TableExtension

from .question_table_composer import QuestionTableQueryComposer


class QuestionTable(Table[QuestionTableRowBase, QuestionSearchParamsBase]):
    """Executes question table queries and validates rows into response models."""

    def __init__(
        self,
        session: Session,
        *,
        extensions: Sequence[TableExtension] | None = None,
        composer: QuestionTableQueryComposer | None = None,
        row_model: type[QuestionTableRowBase] = QuestionTableRowBase,
    ) -> None:
        """Initialize the table service with a session, composer, and row model."""
        composer = composer or QuestionTableQueryComposer(
            extensions=extensions,
            dialect_name=session.get_bind().dialect.name,
        )

        super().__init__(
            session=session,
            row_model=row_model,
            composer=composer,
        )
