from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.core import SessionDep
from backend.developer.tables import (
    DeveloperPersonalQuestionTables,
    DeveloperSharedQuestionTables,
)


def get_developer_personal_question_tables(
    session: SessionDep,
) -> DeveloperPersonalQuestionTables:
    return DeveloperPersonalQuestionTables(session)


def get_developer_shared_question_tables(
    session: SessionDep,
) -> DeveloperSharedQuestionTables:
    return DeveloperSharedQuestionTables(session)


DeveloperPersonalQuestionTablesDependency = Annotated[
    DeveloperPersonalQuestionTables,
    Depends(get_developer_personal_question_tables),
]

DeveloperSharedQuestionTablesDependency = Annotated[
    DeveloperSharedQuestionTables,
    Depends(get_developer_shared_question_tables),
]
