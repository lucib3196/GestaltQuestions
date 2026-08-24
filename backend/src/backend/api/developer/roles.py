from fastapi import APIRouter, HTTPException
from starlette import status

from backend.api.dependencies.users import CurrentUser, UserManagerDependeny
from backend.authorization import AccessDecision
from backend.authorization.roles import UserRoles
from backend.developer import DeveloperProfile
from backend.shared import ID

from .dependencies import DeveloperProfileDependency, DeveloperRoleAccess

router = APIRouter(
    prefix="/roles",
    tags=[
        "Users",
    ],
)


@router.post("/")
async def check_my_status(
    access_policy: DeveloperRoleAccess, id: CurrentUser
) -> AccessDecision:
    access = await access_policy.evaluate(id)
    if not access.allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not allowed {access.reason}",
        )
    return access


@router.get("/{id}")
async def check_status(access_policy: DeveloperRoleAccess, id: ID) -> AccessDecision:
    access = await access_policy.evaluate(id)
    if not access.allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not allowed {access.reason}",
        )
    return access


@router.post("/{user_id}")
async def set_developer_role(
    user_id: ID, user_manager: UserManagerDependeny, profile: DeveloperProfileDependency
) -> DeveloperProfile:
    try:
        await user_manager.add_role_to_user(UserRoles.DEVELOPER, user_id)
        return await profile.set_profile(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e
