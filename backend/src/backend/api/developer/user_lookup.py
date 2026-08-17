from collections.abc import Sequence

from fastapi import APIRouter, HTTPException, Query
from starlette import status

from backend.api.dependencies.users import CurrentUser
from backend.auth import UserDetailRead, UserReadError, UserRoles
from backend.auth import ValidInstitutions
from .dependencies import UserLookupDependency

router = APIRouter(
    prefix="/user-lookup",
    tags=["User Lookup"],
)


@router.get("/developers", response_model=list[UserDetailRead])
async def lookup_developers(
    current_user: CurrentUser,
    user_lookup: UserLookupDependency,
    query: str | None = Query(default=None),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> Sequence[UserDetailRead]:
    try:
        users = user_lookup.find_users(
            [UserRoles.DEVELOPER],
            query=query,
            offset=offset,
            limit=limit,
            exclude_id=current_user,
        )
        return [UserDetailRead.from_model(user) for user in users]
    except UserReadError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to lookup developers",
        ) from e
