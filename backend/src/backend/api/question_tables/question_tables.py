from fastapi import APIRouter
from .dependencies import TableQueryDependecy
from backend.question_views.schema import QuestionSearchParams, QuestionTableRow
from typing import Sequence

router = APIRouter(prefix="/question-tables", tags=["Question Tables"])


@router.post("/search")
async def search_questions(
    service: TableQueryDependecy,
    params: QuestionSearchParams | None = None,
) -> Sequence[QuestionTableRow]:
    return service.search(params)


@router.post("/published/search")
async def search_published_questions(
    service: TableQueryDependecy,
    params: QuestionSearchParams | None = None,
) -> Sequence[QuestionTableRow]:
    params = (params or QuestionSearchParams()).model_copy(
        update={"published": True, "status": None}
    )
    return service.search(params)
