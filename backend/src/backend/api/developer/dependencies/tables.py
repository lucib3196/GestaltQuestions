from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.core import SessionDep
from backend.developer.questions import DeveloperTables
from backend.question.views.services.table_query_service import TableQueryService


def get_developer_tables(
    session: SessionDep,
) -> DeveloperTables:
    return DeveloperTables(TableQueryService(session))


DeveloperTablesDependency = Annotated[
    DeveloperTables,
    Depends(get_developer_tables),
]
