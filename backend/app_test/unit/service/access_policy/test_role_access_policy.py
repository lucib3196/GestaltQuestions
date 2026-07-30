import asyncio
from backend.access_policy.service.access_policy import RoleAccessPolicy, AccessDecision
from uuid import uuid4
import pytest
from types import SimpleNamespace
from backend.auth import UserRoles


@pytest.fixture
def fake_user_manager():
    class FakeUserManager:
        def __init__(self):
            self.user = SimpleNamespace(id=uuid4())
            self.roles = []

        async def get_user(self, user_id):
            return self.user

        async def get_user_role(self, user_id):
            return self.roles

    return FakeUserManager()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("user_roles", "allowed_roles", "access_name", "expected_allowed"),
    [
        (
            [UserRoles.DEVELOPER.value],
            {UserRoles.ADMIN, UserRoles.DEVELOPER},
            "Developer",
            True,
        ),
        (
            [UserRoles.ADMIN.value],
            {UserRoles.ADMIN, UserRoles.DEVELOPER},
            "Developer",
            True,
        ),
        (
            [UserRoles.STUDENT.value],
            {UserRoles.ADMIN, UserRoles.DEVELOPER},
            "Developer",
            False,
        ),
        (
            [UserRoles.TEACHER.value],
            {UserRoles.ADMIN},
            "Admin",
            False,
        ),
        (
            ["  DeVeLoPeR  "],
            {UserRoles.DEVELOPER},
            "Developer",
            True,
        ),
    ],
)
async def test_role_access_policy_evaluates_roles(
    fake_user_manager,
    user_roles,
    allowed_roles,
    access_name,
    expected_allowed,
):
    fake_user_manager.roles = [
        SimpleNamespace(name=role_name)
        for role_name in user_roles
    ]

    policy = RoleAccessPolicy(
        user_manager=fake_user_manager,
        allowed_roles=allowed_roles,
        access_name=access_name,
    )

    decision = await policy.evaluate(uuid4())

    assert decision.allowed is expected_allowed
    
@pytest.mark.asyncio
async def test_role_access_policy_denies_missing_user(fake_user_manager):
    user_id = uuid4()
    fake_user_manager.user = None

    policy = RoleAccessPolicy(
        user_manager=fake_user_manager,
        allowed_roles={UserRoles.ADMIN},
        access_name="Admin",
    )

    decision = await policy.evaluate(user_id)

    assert decision.allowed is False
    assert decision.reason == f"User '{user_id}' not found"