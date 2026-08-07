from collections.abc import Sequence

from fastapi import APIRouter, HTTPException
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.developer.exceptions import DeveloperProfileError
from backend.question_views.schema import QuestionSearchParams, QuestionTableRow

from .dependencies import DeveloperProfileDependency, DeveloperTablesDependency

router = APIRouter(
    prefix="/tables",
    tags=["Developer Tables", "Question Tables"],
)


@router.post("/questions/search", response_model=list[QuestionTableRow])
async def search_my_questions(
    current_user: CurrentUser,
    profiles: DeveloperProfileDependency,
    tables: DeveloperTablesDependency,
    params: QuestionSearchParams | None = None,
) -> Sequence[QuestionTableRow]:
    try:
        profile = await profiles.get_profile(current_user)
        return tables.search_my_questions(profile, params)
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e


@router.post("/questions/collections/search", response_model=list[QuestionTableRow])
async def search_my_collection_questions(
    current_user: CurrentUser,
    profiles: DeveloperProfileDependency,
    tables: DeveloperTablesDependency,
    params: QuestionSearchParams,
) -> Sequence[QuestionTableRow]:
    try:
        profile = await profiles.get_profile(current_user)
        return tables.get_questions_by_collection(profile, params)
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from e


