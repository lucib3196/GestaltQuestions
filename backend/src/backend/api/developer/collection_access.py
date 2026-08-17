from collections.abc import Sequence

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.authorization import AccessLevel, ResourceAccessRevokeResult
from backend.question_collections import QuestionCollectionAccess
from backend.question_collections.exceptions import QuestionCollectionError
from backend.shared import ID

from .dependencies import QuestionCollectionAccessDependency

router = APIRouter(
    prefix="/collection-access",
    tags=["Collection Access"],
)


class ShareCollectionAccessPayload(BaseModel):
    target_user_id: ID
    level: AccessLevel


class UpdateCollectionAccessPayload(BaseModel):
    level: AccessLevel


@router.get("/shared-with-me")
async def get_shared_with_me(
    current_user: CurrentUser,
    collection_access: QuestionCollectionAccessDependency,
) -> Sequence[QuestionCollectionAccess]:
    try:
        return await collection_access.list_access_shared_with(current_user)
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get collection access",
        ) from e


@router.get("/shared-by-me")
async def get_shared_by_me(
    current_user: CurrentUser,
    collection_access: QuestionCollectionAccessDependency,
) -> Sequence[QuestionCollectionAccess]:
    try:
        return await collection_access.list_access_shared_by(current_user)
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get collection access",
        ) from e


@router.post(
    "/{collection_id}/shares",
    response_model=QuestionCollectionAccess,
    status_code=status.HTTP_201_CREATED,
)
async def share_collection(
    collection_id: ID,
    current_user: CurrentUser,
    collection_access: QuestionCollectionAccessDependency,
    payload: ShareCollectionAccessPayload,
) -> QuestionCollectionAccess:
    try:
        return await collection_access.grant_access(
            current_user,
            payload.target_user_id,
            collection_id,
            payload.level,
        )
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share collection",
        ) from e


@router.put(
    "/{collection_id}/shares/{target_user_id}",
    response_model=QuestionCollectionAccess,
)
async def update_collection_share(
    collection_id: ID,
    target_user_id: ID,
    current_user: CurrentUser,
    collection_access: QuestionCollectionAccessDependency,
    payload: UpdateCollectionAccessPayload,
) -> QuestionCollectionAccess:
    try:
        return await collection_access.update_access(
            current_user,
            target_user_id,
            collection_id,
            payload.level,
        )
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update collection share",
        ) from e


@router.delete(
    "/{collection_id}/shares/{target_user_id}",
    response_model=ResourceAccessRevokeResult,
)
async def unshare_collection(
    collection_id: ID,
    target_user_id: ID,
    current_user: CurrentUser,
    collection_access: QuestionCollectionAccessDependency,
) -> ResourceAccessRevokeResult:
    try:
        return await collection_access.revoke_access(
            current_user,
            target_user_id,
            collection_id,
        )
    except QuestionCollectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unshare collection",
        ) from e
