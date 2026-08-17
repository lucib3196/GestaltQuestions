from collections.abc import Sequence

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from backend.access_policy import ResourceAccessRevokeResult
from backend.api.dependencies.users import CurrentUser
from backend.question_access.exceptions import QuestionAccessError
from backend.question_access.model import AccessLevel, QuestionAccess
from backend.shared import ID

from .dependencies import QuestionAccessDependency

router = APIRouter(
    prefix="/question-access",
    tags=["Question Access"],
)


class ShareQuestionAccessPayload(BaseModel):
    target_user_id: ID
    level: AccessLevel


class UpdateQuestionAccessPayload(BaseModel):
    level: AccessLevel


@router.get("/shared-with-me")
async def get_shared_with_me(
    current_user: CurrentUser, question_access: QuestionAccessDependency
) -> Sequence[QuestionAccess]:
    try:
        return await question_access.list_access_shared_with(current_user)
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


@router.get("/shared-by-me")
async def get_shared_by_me(
    current_user: CurrentUser, question_access: QuestionAccessDependency
) -> Sequence[QuestionAccess]:
    try:
        return await question_access.list_access_shared_by(current_user)
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


@router.post(
    "/{question_id}/shares",
    response_model=QuestionAccess,
    status_code=status.HTTP_201_CREATED,
)
async def share_question(
    question_id: ID,
    current_user: CurrentUser,
    question_access: QuestionAccessDependency,
    payload: ShareQuestionAccessPayload,
) -> QuestionAccess:
    try:
        return await question_access.grant_access(
            current_user,
            payload.target_user_id,
            question_id,
            payload.level,
        )
    except QuestionAccessError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share question",
        ) from e


@router.put(
    "/{question_id}/shares/{target_user_id}",
    response_model=QuestionAccess,
)
async def update_question_share(
    question_id: ID,
    target_user_id: ID,
    current_user: CurrentUser,
    question_access: QuestionAccessDependency,
    payload: UpdateQuestionAccessPayload,
) -> QuestionAccess:
    try:
        return await question_access.update_access(
            current_user,
            target_user_id,
            question_id,
            payload.level,
        )
    except QuestionAccessError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update question share",
        ) from e


@router.delete(
    "/{question_id}/shares/{target_user_id}",
    response_model=ResourceAccessRevokeResult,
)
async def unshare_question(
    question_id: ID,
    target_user_id: ID,
    current_user: CurrentUser,
    question_access: QuestionAccessDependency,
) -> ResourceAccessRevokeResult:
    try:
        return await question_access.revoke_access(
            current_user,
            target_user_id,
            question_id,
        )
    except QuestionAccessError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unshare question",
        ) from e
