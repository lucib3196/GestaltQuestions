from fastapi import APIRouter, HTTPException
from starlette import status
from typing import Sequence

from src.core import logger
from src.model.question import Question
from src.model.question import QuestionData
from src.web.dependencies import (
    QuestionDBDependency,
    QuestionManagerDependency,
    StorageTypeDep,
    LocalBaseDep,
)
from src.types import ID
from src.utils import to_serializable


router = APIRouter(
    prefix="/questions",
    tags=["questions", "database"],
)


# POST
@router.post("/")
async def create_question(
    qm: QuestionManagerDependency,
    question: QuestionData,
    storage_type: StorageTypeDep,
    base_path: LocalBaseDep,
) -> Question:

    # Handle the storage path issuye
    if storage_type == "local":
        question.base_path = base_path
    elif storage_type == "cloud":
        if not question.base_path:
            logger.warning(
                "Cannot determine path to question. Base path is none. Setting default path to question"
            )
            question.base_path = "questions"
    try:
        assert question.title
        qcreated = await qm.create_question(question, files=None)
        await qm.write_question_file(
            qcreated.id, "info.json", to_serializable(qcreated.model_dump())
        )

        return qcreated
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create question {e}",
        )


# Retrieving
@router.get("/{qid}")
async def get_question(qid: ID, qm: QuestionManagerDependency) -> Question:
    try:
        question = await qm.qdb.get_question(qid)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not find question {qid}",
            )
        return question
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to get question {e}")


@router.get("/{id}/all_data")
async def get_question_all_data(
    id: ID, qm: QuestionManagerDependency, storage_type: StorageTypeDep
) -> QuestionData:
    try:
        question_data = await qm.qdb.get_question_data(id)
        question_data.question_path = await qm.qdb.get_question_path(id, storage_type)
        return question_data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to retrieve question {e}")


@router.get("/{offset:int}/{limit:int}")
async def get_all_questions(
    qm: QuestionManagerDependency, offset: int = 0, limit: int = 100
) -> Sequence[Question | QuestionData]:
    try:
        return await qm.qdb.get_all_questions(offset, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get all questions {e}",
        )


@router.get("/{offset:int}/{limit:int}/all_data")
async def get_all_questions_data(
    qdb: QuestionDBDependency, offset: int, limit: int
) -> Sequence[QuestionData | Question]:
    data = await qdb.get_all_questions(offset, limit, method="full")
    if not isinstance(data, list):
        raise HTTPException(status_code=500, detail="Invalid data format")
    if not all([isinstance(q, QuestionData) for q in data]):
        raise HTTPException(
            status_code=500,
            detail=f"Invalid data format expected type of QuestionData",
        )
    return data


@router.post("/filter")
async def filter_questions(
    filter_data: QuestionData,
    qm: QuestionManagerDependency,
    storage_type: StorageTypeDep,
) -> Sequence[QuestionData]:
    try:
        logger.debug("Retrieved filter %s", filter_data)
        return await qm.qdb.filter_questions(filter_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to filter question {e}")


@router.delete("/{id}")
async def delete_question(id: ID, qr: QuestionManagerDependency):
    try:
        return await qr.delete_question(id)
    except Exception as e:
        HTTPException(status_code=400, detail=f"Failed to delete question {e}")


@router.put("/{id}")
async def update_question(
    id: ID,
    update: QuestionData,
    qm: QuestionManagerDependency,
) -> QuestionData:

    try:
        return await qm.qdb.update_question(id, update)
    except Exception as e:
        logger.exception(f"Error while updating question {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update question {e}")
