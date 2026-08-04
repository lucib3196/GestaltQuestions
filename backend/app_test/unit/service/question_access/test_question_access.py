from types import SimpleNamespace

import pytest
from sqlmodel import select

from app_test.shared.factories.question_factory import make_question  # noqa: F401
from app_test.shared.factories.user_factory import (  # noqa: F401
    make_developer_profile,
    make_user,
)
from app_test.shared.fakes.fake_user_manager import FakeUserManager
from backend.access_policy import RoleAccessPolicy
from backend.auth import UserRoles
from backend.chat.model import Message, Thread  # noqa: F401
from backend.question import Status
from backend.question_access import QuestionAccessService
from backend.question_access.model import AccessLevel, QuestionAccess


@pytest.fixture
def fake_user_manager():
    return FakeUserManager()


@pytest.fixture
def question_access(db_session, fake_user_manager):
    policy = RoleAccessPolicy(
        user_manager=fake_user_manager,  # type: ignore[arg-type]
        allowed_roles=[UserRoles.DEVELOPER],
        access_name="Developer",
    )
    return QuestionAccessService(db_session, policy)


@pytest.fixture
def owned_question(make_user, make_developer_profile, make_question):
    owner = make_user(email="owner@example.com")
    requester = make_user(email="requester@example.com")

    owner_profile = make_developer_profile(owner)
    requester_profile = make_developer_profile(requester, id=requester.id)
    question = make_question(owner=owner_profile)

    return SimpleNamespace(
        owner=owner,
        owner_profile=owner_profile,
        requester=requester,
        requester_profile=requester_profile,
        question=question,
    )


# --------------------------------------
# --------Getting/Can Access----------------


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "level",
    [
        AccessLevel.VIEW,
        AccessLevel.EDIT,
        AccessLevel.FULL,
    ],
)
async def test_question_owner_has_access(
    question_access,
    fake_user_manager,
    owned_question,
    level,
) -> None:
    fake_user_manager.user = owned_question.owner
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    print("Getting question", owned_question.question)
    decision = await question_access.can_access_question(
        owned_question.owner.id, str(owned_question.question.id), level
    )

    assert decision.allowed is True
    assert decision.reason == "Question owner has full access"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "level",
    [
        AccessLevel.VIEW,
        AccessLevel.EDIT,
        AccessLevel.FULL,
    ],
)
async def test_question_requester_without_ownership_has_no_access(
    question_access,
    fake_user_manager,
    owned_question,
    level,
) -> None:
    fake_user_manager.user = owned_question.requester
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    decision = await question_access.can_access_question(
        owned_question.requester.id, owned_question.question.id, level
    )
    assert decision.allowed is False
    assert decision.reason == "Question access does not exist"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "level",
    [
        AccessLevel.VIEW,
        AccessLevel.EDIT,
        AccessLevel.FULL,
    ],
)
async def test_question_requester_violates_policy(
    question_access,
    fake_user_manager,
    owned_question,
    level,
) -> None:
    fake_user_manager.user = owned_question.requester
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.STUDENT.value)]

    decision = await question_access.can_access_question(
        owned_question.requester.id, owned_question.question.id, level
    )
    assert decision.allowed is False
    assert "Developer access requires" in decision.reason


@pytest.mark.asyncio
async def test_is_question_owner_returns_true_for_owner(
    question_access,
    owned_question,
) -> None:
    decision = await question_access.is_question_owner(
        owned_question.owner.id,
        owned_question.question.id,
    )

    assert decision.allowed is True
    assert decision.reason == "User is the question owner"


@pytest.mark.asyncio
async def test_published_question_grants_view_access_without_shared_access(
    question_access,
    fake_user_manager,
    owned_question,
) -> None:
    fake_user_manager.user = owned_question.requester
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]
    owned_question.question.status = Status.PUBLISHED

    decision = await question_access.can_access_question(
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.VIEW,
    )

    assert decision.allowed is True
    assert decision.reason == "Published question grants public view access"


# --------------------------------------
# --------Creating Access----------------
@pytest.mark.asyncio
@pytest.mark.parametrize(
    "level",
    [
        AccessLevel.VIEW,
        AccessLevel.EDIT,
        AccessLevel.FULL,
    ],
)
async def test_grant_access(
    question_access,
    fake_user_manager,
    owned_question,
    level,
) -> None:
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]
    qaccess = await question_access.grant_access(
        owned_question.owner,
        owned_question.requester,
        owned_question.question.id,
        level,
    )
    assert qaccess.question_id == owned_question.question.id
    assert qaccess.developer_id == owned_question.requester_profile.id
    assert qaccess.access_level == level

    assert await question_access.can_access_question(
        owned_question.requester.id, owned_question.question.id, level
    )


# ---------------------------------
# ----------Updating Access--------


@pytest.mark.asyncio
@pytest.mark.asyncio
@pytest.mark.parametrize(
    "level",
    [
        AccessLevel.VIEW,
        AccessLevel.EDIT,
        AccessLevel.FULL,
    ],
)
async def test_update_access(
    question_access, fake_user_manager, owned_question, level
) -> None:
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]
    qaccess = await question_access.grant_access(
        owned_question.owner,
        owned_question.requester,
        owned_question.question.id,
        AccessLevel.VIEW,
    )
    updated = await question_access.update_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        level,
    )
    assert updated.id == qaccess.id
    assert updated.access_level == level
    assert updated.updated_at >= qaccess.created_at


#
# --------Revoking Access
#


@pytest.mark.asyncio
async def test_revoke_access_removes_question_access(
    db_session,
    question_access,
    fake_user_manager,
    owned_question,
) -> None:
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    qaccess = await question_access.grant_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.FULL,
    )

    revoked = await question_access.revoke_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert revoked.id == qaccess.id

    stored_access = db_session.exec(
        select(QuestionAccess).where(QuestionAccess.id == qaccess.id)
    ).first()
    assert stored_access is None

    decision = await question_access.can_access_question(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert decision.allowed is False
    assert decision.reason == "Question access does not exist"
