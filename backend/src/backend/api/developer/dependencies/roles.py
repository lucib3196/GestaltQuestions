from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.users import UserManagerDependeny
from backend.authorization.policies import RoleAccessPolicy
from backend.authorization.roles import UserRoles


def get_developer_role_access(user_manager: UserManagerDependeny) -> RoleAccessPolicy:
    return RoleAccessPolicy(
        user_manager=user_manager,
        allowed_roles=[UserRoles.DEVELOPER],
        access_name="Developer",
    )


DeveloperRoleAccess = Annotated[
    RoleAccessPolicy,
    Depends(get_developer_role_access),
]
