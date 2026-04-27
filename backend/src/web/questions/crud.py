
from fastapi import APIRouter, HTTPException
from starlette import status
from typing import Sequence
from src.web.question_manager.dependencies import QuestionDBDependency
from src.model.question import Question

from src.web.dependencies import (
    QuestionDBDependency,
)
from src.app_types.general import ID
from src.model.question import QuestionRead


router = APIRouter(
    prefix="/questions",
    tags=[
        "questions",
    ],
)


# Retrieving
@router.get("/{qid}")
async def get_question(qid: ID, qdb: QuestionDBDependency) -> Question:
    try:
        question = await qdb.get_question(qid)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not find question {qid}",
            )
        return question
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to get question {e}")


@router.get("/{offset:int}/{limit:int}")
async def get_all_questions(
    qdb: QuestionDBDependency, offset: int = 0, limit: int = 100
) -> Sequence[Question | QuestionRead]:
    try:
        return await qdb.get_all_questions(offset, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get all questions {e}",
        )
