from fastapi import APIRouter, HTTPException
import src.data
from starlette import status
from datetime import timedelta
from typing import Sequence
from src.web.question_manager.dependencies import QuestionDBDependency
from src.model.question import Question
from fastapi import APIRouter, Depends, HTTPException, Query
from src.web.dependencies import (
    QuestionDBDependency,
)
from src.app_types.general import ID
from src.model.question import QuestionRead
from firebase_admin import storage
from src.web.dependencies import StorageDependency

from src.core.config import get_settings

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


@router.get("/{question_id}/image-url")
async def get_question_image_url(
    question_id: ID,
    qdb: QuestionDBDependency,
    path: str = Query(
        ..., description="Cloud storage path, e.g. questions/q1/clientFiles/img.png"
    ),
):
    if not path or ".." in path or path.startswith("/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid path",
        )

    try:
        question = await qdb.get_question(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not find question {question_id}",
            )
        clean_base = (question.storage_path or "").strip("/")
        clean_path = (path or "").strip("/")
        object_path = f"{clean_base}/{clean_path}"
        blob = storage.bucket().blob(object_path)

        print("bucket.name =", storage.bucket().name)
        print("question.storage_path =", repr(question.storage_path))
        print("path =", repr(path))
        print("object_path =", repr(object_path))
        print("exists =", blob.exists())

        if not blob.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found",
            )

        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=10),
            method="GET",
            scheme="https",
            api_access_endpoint="http://localhost:9199",
        )

        return {"url": signed_url, "expires_in_seconds": 600}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate image URL",
        )
