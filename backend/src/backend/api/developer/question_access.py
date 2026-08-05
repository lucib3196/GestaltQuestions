from fastapi import APIRouter, HTTPException, Query
from starlette import status

from backend.access_policy import AccessDecision
from backend.api.dependencies.users import CurrentUser
from backend.question_access.exceptions import QuestionAccessError
from backend.question_access.model import AccessLevel, QuestionAccess
from backend.shared import ID

from .dependencies import QuestionAccessDependency

router = APIRouter(
    prefix="/question-access",
    tags=["Question-Access"],
)


@router.get("/{question_id}")
async def get_my_question_access(
    question_id: ID,
    current_user: CurrentUser,
    question_access: QuestionAccessDependency,
) -> QuestionAccess | None:
    try:
        return await question_access.get_access_by_id(current_user, question_id)
    except QuestionAccessError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get question access",
        ) from e


@router.get("/{question_id}/decision")
async def get_my_question_access_decision(
    question_id: ID,
    current_user: CurrentUser,
    question_access: QuestionAccessDependency,
    minimum_level: AccessLevel = Query(default=AccessLevel.VIEW),
) -> AccessDecision:
    try:
        return await question_access.has_access_by_id(
            current_user,
            question_id,
            minimum_level,
        )
    except QuestionAccessError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check question access",
        ) from e


