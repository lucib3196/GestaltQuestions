from typing import Annotated

from fastapi import Depends

from backend.api.dependencies import SessionDep
from backend.question_views.service.table_query_service import TableQueryService


def get_tables(
    session: SessionDep,
) -> TableQueryService:
    return TableQueryService(session)


TableQueryDependecy = Annotated[TableQueryService, Depends(get_tables)]
