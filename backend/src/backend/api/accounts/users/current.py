from fastapi import APIRouter, HTTPException
from starlette import status

from backend.accounts import UserNotFound, UserRead
from backend.api.deps import CurrentUser, FireBaseToken, UserManagerDependeny

router = APIRouter(prefix="/users", tags=["Current User"])


@router.get("/", response_model=UserRead)
async def get_user(
    user_manager: UserManagerDependeny,
    current_user: CurrentUser,
) -> UserRead:
    try:
        return await user_manager.read_user(current_user)
    except UserNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from None
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information",
        ) from None


@router.post("/get_current_user", response_model=UserRead)
def get_current_user(token: FireBaseToken) -> UserRead:
    return UserRead(email=token.get("email", None))
