from fastapi import APIRouter, HTTPException
from starlette import status

from backend.accounts import User, UserRead
from backend.api.deps import UserManagerDependeny
from backend.authorization.roles import UpdateUserRole
from backend.core import logger
from backend.shared import ID

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/{id}", response_model=User)
async def get_user_by_id(user_manager: UserManagerDependeny, id: ID) -> User:
    """
    Retrieve a user by internal ID.

    This endpoint is intended for backend/admin flows where user IDs are
    already known.
    """
    try:
        user = await user_manager.get_user(id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{id}' not found",
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to retrieve user by id='%s'", id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user '{id}': {e}",
        ) from e


@router.delete("/{id}")
async def delete_user_by_id(
    user_manager: UserManagerDependeny,
    id: ID,
) -> dict[str, str]:
    """
    Delete a user by internal ID.

    This endpoint is intended for backend/admin flows.
    """
    try:
        user = await user_manager.get_user(id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{id}' not found",
            )
        await user_manager.delete_user(id)
        return {"detail": "user deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to delete user id='%s'", id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user '{id}': {e}",
        ) from e


@router.get("/{id}/roles", response_model=UserRead)
async def get_user_roles_by_id(user_manager: UserManagerDependeny, id: ID) -> UserRead:
    """
    Retrieve all roles for a user by internal ID.

    This endpoint is intended for backend/admin flows.
    """
    try:
        user = await user_manager.get_user(id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{id}' not found",
            )
        return UserRead.from_model(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to retrieve roles for user id='%s'", id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve roles for user '{id}': {e}",
        ) from e


@router.post("/{id}/roles", response_model=UserRead)
async def add_user_role(
    user_manager: UserManagerDependeny,
    id: ID,
    payload: UpdateUserRole,
) -> UserRead:
    """
    Add a role to a user by internal ID and return the updated role set.

    This endpoint is intended for backend/admin flows.
    """
    try:
        user_record = await user_manager.get_user(id)
        if user_record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{id}' not found",
            )
        user = await user_manager.add_role_to_user(role=payload.role, user=id)
        return UserRead.from_model(user)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role update for user '{id}': {e}",
        ) from e
    except Exception as e:
        logger.exception("Failed to add role '%s' to user id='%s'", payload.role, id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add role for user '{id}': {e}",
        ) from e
