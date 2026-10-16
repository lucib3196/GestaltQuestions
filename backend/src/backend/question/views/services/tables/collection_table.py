from collections.abc import Sequence

from sqlmodel import Session

from backend.question.collections import QuestionCollection
from backend.question.views.schema import CollectionSearchParams
from backend.tables import Table, TableExtension, TableQueryComposer


class CollectionTable(Table[QuestionCollection, CollectionSearchParams]):
    def __init__(
        self,
        session: Session,
        *,
        extension: Sequence[TableExtension] | None = None,
        composer: TableQueryComposer,
        row_model: type[QuestionCollection] = QuestionCollection,
    ) -> None:
        super().__init__(session, row_model=row_model, composer=composer)
