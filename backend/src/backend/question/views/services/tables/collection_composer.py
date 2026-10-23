from collections.abc import Sequence

from backend.question.views.schema import CollectionSearchParams
from backend.tables import FilterBuilder, TableExtension, TableQueryComposer


class CollectionTableFilterBuilder(FilterBuilder[CollectionSearchParams]):
    def __init__(self, params: CollectionSearchParams) -> None:
        super().__init__(params)


class CollectionQueryComposer(TableQueryComposer[CollectionSearchParams]):
    def __init__(
        self,
        extensions: Sequence[TableExtension] | None = None,
        *,
        dialect_name: str,
    ) -> None:
        super().__init__(
            search_params_model=CollectionSearchParams,
            filter_builder=CollectionTableFilterBuilder,
            extensions=extensions,
            dialect_name=dialect_name,
        )
