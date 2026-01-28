import pytest
from src.database.models.users import UserRoles, Role
from src.api.core import logger



@pytest.mark.asyncio
async def test_create_role(role_manager):
    r = await role_manager.create_role(UserRoles.ADMIN)
    logger.info("Created role %s", r)
    assert r
    assert isinstance(r, Role)
    
@pytest.mark.asyncio
async def test_does_role_exist(role_manager):
    # Create the role
    r = await role_manager.create_role(UserRoles.ADMIN)
    assert await role_manager.does_role_exist(UserRoles.ADMIN)
    

@pytest.mark.parametrize(
    "role", [UserRoles.ADMIN, UserRoles.DEVELOPER, UserRoles.STUDENT, UserRoles.TEACHER]
)
def test_set_user_role(make_user, user_db, role_db,role):
    r = role_db.create_role(role, "")
    user = make_user()
    assert r
    user = user_db.set_user_role(user.id, role)
    assert user
    assert user.role.name == role.value