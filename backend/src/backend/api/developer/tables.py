from collections.abc import Sequence

from fastapi import APIRouter, HTTPException
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.developer.exceptions import DeveloperProfileError
from backend.developer.tables import SharedWithMeQuestionTableRow
from backend.developer.tables.personal_questions import PersonalQuestionTableRow
from backend.developer.tables.shared_questions import SharedByMeQuestionTableRow
from backend.question.views.schema import QuestionSearchParams, QuestionTableRow

from .dependencies import (
    DeveloperPersonalQuestionTablesDependency,
    DeveloperProfileDependency,
    DeveloperSharedQuestionTablesDependency,
)

router = APIRouter(
    prefix="/tables",
    tags=["Developer Tables", "Question Tables"],
)


@router.post("/questions/search", response_model=list[PersonalQuestionTableRow])
async def search_my_questions(
    current_user: CurrentUser,
    profiles: DeveloperProfileDependency,
    tables: DeveloperPersonalQuestionTablesDependency,
    params: QuestionSearchParams | None = None,
) -> Sequence[PersonalQuestionTableRow]:
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
    tables: DeveloperPersonalQuestionTablesDependency,
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


@router.post(
    "/questions/shared-with-me/search",
    response_model=list[SharedWithMeQuestionTableRow],
)
async def search_shared_with_me_questions(
    current_user: CurrentUser,
    profiles: DeveloperProfileDependency,
    tables: DeveloperSharedQuestionTablesDependency,
    params: QuestionSearchParams | None = None,
) -> Sequence[SharedWithMeQuestionTableRow]:
    try:
        profile = await profiles.get_profile(current_user)
        return tables.search_shared_with_me(profile, params)
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e


@router.post(
    "/questions/shared-by-me/search",
    response_model=list[SharedByMeQuestionTableRow],
)
async def search_shared_by_me_questions(
    current_user: CurrentUser,
    profiles: DeveloperProfileDependency,
    tables: DeveloperSharedQuestionTablesDependency,
    params: QuestionSearchParams | None = None,
) -> Sequence[SharedByMeQuestionTableRow]:
    try:
        profile = await profiles.get_profile(current_user)
        return tables.search_shared_by_me(profile, params)
    except DeveloperProfileError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e
