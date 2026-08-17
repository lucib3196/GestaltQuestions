from types import SimpleNamespace
from uuid import uuid4

import pytest

from app_test.fakes import FakeUserManager
from backend.accounts import UserRoles
from backend.authorization.exceptions import AccessPolicyDenied
from backend.authorization.policies.role_policy import RoleAccessPolicy


@pytest.fixture
def fake_user_manager():
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
) -> None:
    fake_user_manager.roles = [
        SimpleNamespace(name=role_name) for role_name in user_roles
    ]

    policy = RoleAccessPolicy(
        user_manager=fake_user_manager,
        allowed_roles=allowed_roles,
        access_name=access_name,
    )

    decision = await policy.evaluate(uuid4())

    assert decision.allowed is expected_allowed


@pytest.mark.asyncio
async def test_role_access_policy_denies_missing_user(fake_user_manager) -> None:
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


@pytest.mark.asyncio
async def test_role_access_policy_require_access_raises_when_denied(
    fake_user_manager,
) -> None:
    user_id = uuid4()
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.STUDENT.value)]

    policy = RoleAccessPolicy(
        user_manager=fake_user_manager,
        allowed_roles={UserRoles.ADMIN},
        access_name="Admin",
    )

    with pytest.raises(AccessPolicyDenied):
        await policy.require_access(user_id)
