from typing import List

from fastapi import APIRouter, HTTPException
from firebase_admin import auth
from pydantic import BaseModel
import requests
from starlette import status

from src.core.logging import logger
from src.core.config import get_settings
from src.model.institution import ValidInstitutions
from src.app_types.general import ID
from src.model.users import Role, User, UserCreate, UserRead, UserRoles
from src.web.dependencies import FireBaseToken, UserManagerDependeny


router = APIRouter(prefix="/users", tags=["users"])


class CreateUserFullPayload(BaseModel):
    user: UserCreate
    role: UserRoles = UserRoles.STUDENT
    institution: ValidInstitutions | None = None


class UpdateUserRole(BaseModel):
    role: UserRoles


class LoginRequest(BaseModel):
    id_token: str


class UserRoleResponse(BaseModel):
    user: User
    roles: List[Role] = []


@router.post("/")
async def create_user(
    user_manager: UserManagerDependeny,
    payload: CreateUserFullPayload,
):
    try:
        logger.debug("Attempting to create user")
        created_user = await user_manager.create_user(
            data=payload.user, role=payload.role
        )
        return created_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occured while creating the user {e}",
        )


@router.post("/login")
async def login(payload: LoginRequest):
    decoded = auth.verify_id_token(payload.id_token)
    user_read = UserRead(
        email=decoded.get("email", None),
    )
    return user_read


@router.post("/get_current_user")
def get_current_user(
    token: FireBaseToken,
) -> UserRead:
    decoded = token
    user_read = UserRead(email=decoded.get("email", None))
    return user_read


@router.post("/login_test")
def emulator_login(email: str, password: str):
    """Testing endpoint for login using password and email

    Args:
        email (str):
        password (str):

    Returns:
        _type_: _description_
    """
    settings = get_settings()
    emulator_host = settings.FIREBASE_AUTH_EMULATOR_HOST or "host.docker.internal:9099"
    if not emulator_host.startswith(("http://", "https://")):
        emulator_host = f"http://{emulator_host}"
    emulator_host = emulator_host.rstrip("/")
    url = f"{emulator_host}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key"

    payload = {"email": email, "password": password, "returnSecureToken": True}

    response = requests.post(url, json=payload)
    return response.json()


# ---------- ID-based user management
# These endpoints operate directly on internal user IDs and are intended for
# service/admin workflows rather than frontend token-based self-service paths.


@router.get("/{id}")
async def get_user_by_id(user_manager: UserManagerDependeny, id: ID) -> User | None:
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
        )


@router.delete("/{id}")
async def delete_user_by_id(user_manager: UserManagerDependeny, id: ID):
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
        )


@router.get("/{id}/roles")
async def get_user_roles_by_id(
    user_manager: UserManagerDependeny, id: ID
) -> List[Role]:
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
        return await user_manager.get_user_role(id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to retrieve roles for user id='%s'", id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve roles for user '{id}': {e}",
        )


@router.post("/{id}/roles")
async def add_user_role(
    user_manager: UserManagerDependeny, id: ID, payload: UpdateUserRole
) -> UserRoleResponse:
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
        roles = await user_manager.get_user_role(id)
        return UserRoleResponse(user=user, roles=roles)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Failed to add role '%s' to user id='%s'", payload.role, id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add role for user '{id}': {e}",
        )
