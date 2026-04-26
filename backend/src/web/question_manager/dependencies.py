from typing import Annotated

from fastapi import Depends

from src.service.question_manager.developer_question_service import DeveloperQuestionService
from src.web.user.dependencies import DeveloperAccess
from src.web.dependencies import StorageDependency, SessionDep, QuestionDBDependency
from src.service.question_manager.question_manager import QuestionManager


def get_question_manager(
    session: SessionDep,
    storage: StorageDependency,
    question_db: QuestionDBDependency,
    dev_access: DeveloperAccess,
) -> DeveloperQuestionService:
    question_manager = QuestionManager(storage, question_db)
    return DeveloperQuestionService(
        session=session, developer_access=dev_access, question_manager=question_manager
    )


DeveloperQuestionManagerDependency = Annotated[
    DeveloperQuestionService, Depends(get_question_manager)
]
