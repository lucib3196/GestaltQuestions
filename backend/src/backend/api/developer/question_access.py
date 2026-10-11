from collections.abc import Sequence
from uuid import UUID

from fastapi import APIRouter, HTTPException
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.authorization import AccessPolicyError, ResourceAccessRevokeResult
from backend.question.access.exceptions import QuestionAccessError
from backend.question.access.models import QuestionAccess
from backend.question.access.schema import (
    QuestionAccessDetailRead,
    ShareQuestionAccessPayload,
    ShareQuestionBatchResult,
    ShareQuestionsWithUsersPayload,
    UpdateQuestionAccessPayload,
)
from backend.shared import ID

from .dependencies import QuestionAccessDependency, QuestionSharingDependency

router = APIRouter(
    prefix="/question-access",
    tags=["Question Access"],
)


@router.get("/shared-with-me")
async def get_shared_with_me(
    current_user: CurrentUser, question_sharing: QuestionSharingDependency
) -> Sequence[QuestionAccess]:
    try:
        return await question_sharing.list_shared_with_me(current_user)
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get question access",
        ) from e


@router.get("/{qid}/access-details")
async def list_question_access_details(
    current_user: CurrentUser, question_access: QuestionAccessDependency, qid: ID
) -> Sequence[QuestionAccessDetailRead]:
    try:
        return await question_access.list_resource_access_details(
            qid, owner=current_user
        )
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
    current_user: CurrentUser, question_sharing: QuestionSharingDependency
) -> Sequence[QuestionAccess]:
    try:
        return await question_sharing.list_shared_by_me(current_user)
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get question access",
        ) from e


@router.get("/{qid}")
async def check_access(
    current_user: CurrentUser,
    question_access: QuestionAccessDependency,
    qid: UUID | str,
) -> QuestionAccess:
    try:
        access = await question_access.retrieve_access(current_user, qid)
        if not access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access not allowed"
            )
        return access
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={str(e)}
        ) from e


@router.post(
    "/{question_id}/shares",
    response_model=QuestionAccess,
    status_code=status.HTTP_201_CREATED,
)
async def share_question(
    question_id: ID,
    current_user: CurrentUser,
    question_sharing: QuestionSharingDependency,
    payload: ShareQuestionAccessPayload,
) -> QuestionAccess:
    """Updating is the safer version for this"""
    try:
        return await question_sharing.update_user_access(
            current_user,
            payload.target_user_id,
            question_id,
            payload.level,
        )
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share question",
        ) from e


@router.post(
    "/shares/batch",
    response_model=ShareQuestionBatchResult,
    status_code=status.HTTP_201_CREATED,
)
async def share_questions_with_users(
    current_user: CurrentUser,
    question_sharing: QuestionSharingDependency,
    payload: ShareQuestionsWithUsersPayload,
) -> ShareQuestionBatchResult:
    try:
        return await question_sharing.share_questions_with_users(
            current_user,
            payload.question_ids,
            payload.target_user_ids,
            payload.level,
        )
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share question",
        ) from e


@router.patch(
    "/{question_id}/shares/{target_user_id}",
    response_model=QuestionAccess,
)
async def update_question_share(
    question_id: ID,
    target_user_id: ID,
    current_user: CurrentUser,
    question_sharing: QuestionSharingDependency,
    payload: UpdateQuestionAccessPayload,
) -> QuestionAccess:
    try:
        return await question_sharing.update_user_access(
            current_user,
            target_user_id,
            question_id,
            payload.level,
        )
    except AccessPolicyError as e:
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
    question_sharing: QuestionSharingDependency,
) -> ResourceAccessRevokeResult:
    try:
        return await question_sharing.unshare_with_user(
            current_user,
            target_user_id,
            question_id,
        )
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unshare question",
        ) from e
