from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.core import SessionDep
from backend.api.dependencies.storage import StorageDependency
from backend.api.dependencies.users import UserManagerDependeny
from backend.developer.profiles import DeveloperProfileService


def get_developer_profile_service(
    session: SessionDep,
    storage: StorageDependency,
    user_manager: UserManagerDependeny,
) -> DeveloperProfileService:
    return DeveloperProfileService(
        session=session,
        storage=storage,
        user_manager=user_manager,
    )


DeveloperProfileDependency = Annotated[
    DeveloperProfileService,
    Depends(get_developer_profile_service),
]
