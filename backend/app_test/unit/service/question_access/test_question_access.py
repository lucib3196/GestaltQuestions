from types import SimpleNamespace

import pytest

from app_test.shared.fakes.fake_user_manager import FakeUserManager
from backend.access_policy import RoleAccessPolicy
from backend.auth import UserRoles
from backend.chat.model import Message, Thread  # noqa: F401
from backend.question_access import QuestionAccessService


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
    question = make_question(owner=owner_profile)

    return SimpleNamespace(
        owner=owner,
        requester=requester,
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
        ("can_view_question", "Question is not shared with this user"),
        ("can_edit_question", "Question is not shared with this user"),
        (
            "can_delete_question",
            "Only the question owner can delete this question",
        ),
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
