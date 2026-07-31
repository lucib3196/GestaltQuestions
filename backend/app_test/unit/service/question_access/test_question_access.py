from types import SimpleNamespace

import pytest
from sqlmodel import select

from app_test.shared.fakes.fake_user_manager import FakeUserManager
from app_test.shared.factories.user_factory import make_user, make_developer_profile
from app_test.shared.factories.question_factory import make_question
from backend.access_policy import RoleAccessPolicy
from backend.auth import UserRoles
from backend.chat.model import Message, Thread  # noqa: F401
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


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "access_method",
    [
        "can_view_question",
        "can_edit_question",
        "can_delete_question",
    ],
)
async def test_question_owner_has_access(
    question_access,
    fake_user_manager,
    owned_question,
    access_method,
) -> None:
    fake_user_manager.user = owned_question.owner
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    decision = await getattr(question_access, access_method)(
        owned_question.owner.id,
        owned_question.question.id,
    )

    assert decision.allowed is True
    assert decision.reason == "Question owner has full access"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("access_method", "expected_reason"),
    [
        ("can_view_question", "Question access does not exist"),
        ("can_edit_question", "Question access does not exist"),
        ("can_delete_question", "Question access does not exist"),
    ],
)
async def test_question_requester_without_ownership_has_no_access(
    question_access,
    fake_user_manager,
    owned_question,
    access_method,
    expected_reason,
) -> None:
    fake_user_manager.user = owned_question.requester
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    decision = await getattr(question_access, access_method)(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert decision.allowed is False
    assert decision.reason == expected_reason


@pytest.mark.asyncio
async def test_grant_access_creates_question_access(
    question_access,
    fake_user_manager,
    owned_question,
) -> None:
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    qaccess = await question_access.grant_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.VIEW,
    )

    assert qaccess.question_id == owned_question.question.id
    assert qaccess.developer_id == owned_question.requester.id
    assert qaccess.access_level == AccessLevel.VIEW

    view_decision = await question_access.can_view_question(
        owned_question.requester.id,
        owned_question.question.id,
    )
    edit_decision = await question_access.can_edit_question(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert view_decision.allowed is True
    assert view_decision.reason == "Question access granted"
    assert edit_decision.allowed is False
    assert edit_decision.reason == (
        f"Question access level {AccessLevel.VIEW} "
        f"is below required level {AccessLevel.EDIT}"
    )


@pytest.mark.asyncio
async def test_update_access_changes_access_level(
    question_access,
    fake_user_manager,
    owned_question,
) -> None:
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]

    qaccess = await question_access.grant_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.VIEW,
    )

    updated = await question_access.update_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.EDIT,
    )

    assert updated.id == qaccess.id
    assert updated.access_level == AccessLevel.EDIT
    assert updated.updated_at >= qaccess.created_at

    edit_decision = await question_access.can_edit_question(
        owned_question.requester.id,
        owned_question.question.id,
    )
    delete_decision = await question_access.can_delete_question(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert edit_decision.allowed is True
    assert delete_decision.allowed is False

    full_access = await question_access.update_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.FULL,
    )

    assert full_access.access_level == AccessLevel.FULL

    delete_decision = await question_access.can_delete_question(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert delete_decision.allowed is True


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

    decision = await question_access.can_view_question(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert decision.allowed is False
    assert decision.reason == "Question access does not exist"
