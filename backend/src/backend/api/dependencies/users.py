from typing import Annotated

from fastapi import Depends, HTTPException
from starlette import status

from backend.accounts import UserManager

from .auth import FireBaseToken
from .core import SessionDep


def get_user_mng(session: SessionDep) -> UserManager:
    return UserManager(
        session=session,
    )


def get_current_user_id(
    token: FireBaseToken,
) -> str:
    try:
        user_id = token.get("user_id", None)
        if user_id is None:
            raise HTTPException(
                detail="Failed to retrieve signed in user",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            detail=f"Failed to retrieve signed in user {e}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from e


UserManagerDependeny = Annotated[UserManager, Depends(get_user_mng)]
CurrentUser = Annotated[str, Depends(get_current_user_id)]

__all__ = [
    "CurrentUser",
    "UserManagerDependeny",
    "get_current_user_id",
    "get_user_mng",
]
