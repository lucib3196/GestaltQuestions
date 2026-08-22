from fastapi import APIRouter, HTTPException
from firebase_admin import auth
from pydantic import BaseModel
from starlette import status

from backend.accounts import CreateUserFullPayload, UserRead
from backend.api.deps import UserManagerDependeny
from backend.core import logger

router = APIRouter(prefix="/users", tags=["User Auth"])


class LoginRequest(BaseModel):
    id_token: str


@router.post("/", response_model=UserRead)
async def create_user(
    user_manager: UserManagerDependeny,
    payload: CreateUserFullPayload,
) -> UserRead:
    try:
        logger.debug("Attempting to create user")
        created_user = await user_manager.create_user(
            role=payload.role,
            data=payload.user,
            institution=payload.institution,
        )
        return UserRead.from_model(created_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occured while creating the user {e}",
        ) from e


@router.post("/login", response_model=UserRead)
async def login(payload: LoginRequest) -> UserRead:
    decoded = auth.verify_id_token(payload.id_token)
    return UserRead(email=decoded.get("email", None))
