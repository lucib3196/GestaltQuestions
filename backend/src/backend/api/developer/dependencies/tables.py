from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.core import SessionDep
from backend.developer.tables import (
    DeveloperPersonalQuestionTables,
    DeveloperSharedQuestionTables,
)
from backend.question.views.services.table_query_service import TableQueryService


def get_developer_personal_question_tables(
    session: SessionDep,
) -> DeveloperPersonalQuestionTables:
    return DeveloperPersonalQuestionTables(TableQueryService(session))


def get_developer_shared_question_tables(
    session: SessionDep,
) -> DeveloperSharedQuestionTables:
    return DeveloperSharedQuestionTables(TableQueryService(session))


DeveloperPersonalQuestionTablesDependency = Annotated[
    DeveloperPersonalQuestionTables,
    Depends(get_developer_personal_question_tables),
]

DeveloperSharedQuestionTablesDependency = Annotated[
    DeveloperSharedQuestionTables,
    Depends(get_developer_shared_question_tables),
]
