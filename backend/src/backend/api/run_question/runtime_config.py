from uuid import UUID

from fastapi import APIRouter

from backend.api.deps import QuestionRuntimeDBDependency
from backend.question_runtime.schema import (
    QuestionRuntimeCreate,
    QuestionRuntimeRead,
)

router = APIRouter(
    prefix="/questions/{qid}/runtimes",
    tags=["questions", "runtime-config"],
)


@router.get("/", response_model=list[QuestionRuntimeRead])
async def list_runtimes(qid: UUID|str, runtime_db: QuestionRuntimeDBDependency):
    return await runtime_db.list_question_runtimes(qid)


@router.post("/", response_model=QuestionRuntimeRead)
async def create_runtime(
    qid: UUID|str,
    payload: QuestionRuntimeCreate,
    runtime_db: QuestionRuntimeDBDependency,
):
    return await runtime_db.create(qid, payload)
