from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.core import SessionDep
from backend.developer.tables import (
    DeveloperPersonalQuestionTables,
    DeveloperPublishedQuestionTables,
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


def get_developer_published_question_tables(
    session: SessionDep,
) -> DeveloperPublishedQuestionTables:
    return DeveloperPublishedQuestionTables(session)


DeveloperPersonalQuestionTablesDependency = Annotated[
    DeveloperPersonalQuestionTables,
    Depends(get_developer_personal_question_tables),
]

DeveloperSharedQuestionTablesDependency = Annotated[
    DeveloperSharedQuestionTables,
    Depends(get_developer_shared_question_tables),
]

DeveloperPublishedQuestionTablesDependency = Annotated[
    DeveloperPublishedQuestionTables,
    Depends(get_developer_published_question_tables),
]
