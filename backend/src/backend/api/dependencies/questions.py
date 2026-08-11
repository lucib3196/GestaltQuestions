from typing import Annotated

from fastapi import Depends

from backend.question import QuestionDB, QuestionQueryService
from backend.question_manager import QuestionManager

from .core import SessionDep
from .storage import StorageDependency


def get_question_database(
    session: SessionDep,
) -> QuestionDB:
    return QuestionDB(session)


QuestionDBDependency = Annotated[QuestionDB, Depends(get_question_database)]


def get_question_query(
    session: SessionDep,
) -> QuestionQueryService:
    return QuestionQueryService(session)


QuestionQueryDependency = Annotated[QuestionQueryService, Depends(get_question_query)]


def get_question_manager(
    storage: StorageDependency,
    question_db: QuestionDBDependency,
) -> QuestionManager:
    return QuestionManager(storage=storage, qdb=question_db)


QuestionManagerDependency = Annotated[QuestionManager, Depends(get_question_manager)]

__all__ = [
    "QuestionDBDependency",
    "QuestionManagerDependency",
    "QuestionQueryDependency",
    "get_question_database",
    "get_question_manager",
    "get_question_query",
]
