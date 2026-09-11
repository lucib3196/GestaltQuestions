from collections.abc import Sequence

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from starlette import status

from backend.accounts import UserDetailRead, UserReadError
from backend.api.dependencies.users import CurrentUser
from backend.shared import ID

from .dependencies import DeveloperProfileDependency, UserLookupDependency

router = APIRouter(
    prefix="/user-lookup",
    tags=["User Lookup"],
)


class LookUp(BaseModel):
    query: str | None = None
    excluded: list[ID] = Field(default_factory=list)
    offset: int = 0
    limit: int = 10


@router.post("/developers", response_model=list[UserDetailRead])
async def lookup_developers(
    current_user: CurrentUser,
    user_lookup: UserLookupDependency,
    profiles: DeveloperProfileDependency,
    args: LookUp,
) -> Sequence[UserDetailRead]:
    try:
        current_profile = await profiles.get_profile(current_user)
        excluded = [current_profile.id, *args.excluded]

        users = user_lookup.find_developers(
            query=args.query,
            offset=args.offset,
            limit=args.limit,
            exclude_developer_ids=excluded,
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
