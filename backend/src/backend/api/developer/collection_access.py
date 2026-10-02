from collections.abc import Sequence

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.authorization import (
    AccessLevel,
    AccessPolicyError,
    ResourceAccessRevokeResult,
)
from backend.developer.collections.sharing import ShareCollectionBatchResult
from backend.question.collections import QuestionCollectionAccess
from backend.shared import ID

from .dependencies import (
    CollectionSharingDependency,
    QuestionCollectionAccessDependency,
)

router = APIRouter(
    prefix="/collection-access",
    tags=["Collection Access"],
)


class ShareCollectionAccessPayload(BaseModel):
    target_user_id: ID
    level: AccessLevel


class ShareCollectionsWithUsersPayload(BaseModel):
    collection_ids: list[ID]
    target_user_ids: list[ID]
    level: AccessLevel


class UpdateCollectionAccessPayload(BaseModel):
    level: AccessLevel


@router.get("/shared-with-me")
async def get_shared_with_me(
    current_user: CurrentUser,
    collection_sharing: CollectionSharingDependency,
) -> Sequence[QuestionCollectionAccess]:
    try:
        return await collection_sharing.list_shared_with_me(current_user)
    except AccessPolicyError as e:
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
    collection_sharing: CollectionSharingDependency,
) -> Sequence[QuestionCollectionAccess]:
    try:
        return await collection_sharing.list_shared_by_me(current_user)
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get collection access",
        ) from e


@router.get("/{collection_id}")
async def check_access(
    current_user: CurrentUser,
    collection_access: QuestionCollectionAccessDependency,
    collection_id: ID,
) -> QuestionCollectionAccess:
    try:
        access = await collection_access.check_access(current_user, collection_id)
        if not access.access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access not allowed"
            )
        return access.access
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={str(e)}
        ) from e


@router.post(
    "/{collection_id}/shares",
    response_model=QuestionCollectionAccess,
    status_code=status.HTTP_201_CREATED,
)
async def share_collection(
    collection_id: ID,
    current_user: CurrentUser,
    collection_sharing: CollectionSharingDependency,
    payload: ShareCollectionAccessPayload,
) -> QuestionCollectionAccess:
    try:
        return await collection_sharing.update_user_access(
            current_user,
            payload.target_user_id,
            collection_id,
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
            detail="Failed to share collection",
        ) from e


@router.post(
    "/shares/batch",
    response_model=ShareCollectionBatchResult,
    status_code=status.HTTP_201_CREATED,
)
async def share_collections_with_users(
    current_user: CurrentUser,
    collection_sharing: CollectionSharingDependency,
    payload: ShareCollectionsWithUsersPayload,
) -> ShareCollectionBatchResult:
    try:
        return await collection_sharing.share_collections_with_users(
            current_user,
            payload.collection_ids,
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
    collection_sharing: CollectionSharingDependency,
    payload: UpdateCollectionAccessPayload,
) -> QuestionCollectionAccess:
    try:
        return await collection_sharing.update_user_access(
            current_user,
            target_user_id,
            collection_id,
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
    collection_sharing: CollectionSharingDependency,
) -> ResourceAccessRevokeResult:
    try:
        return await collection_sharing.unshare_with_user(
            current_user,
            target_user_id,
            collection_id,
        )
    except AccessPolicyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unshare collection",
        ) from e
