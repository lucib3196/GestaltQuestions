from types import SimpleNamespace

import pytest
from app_test.fakes import FakeStorage, FakeUserManager
from sqlmodel import select

from backend.access_policy import AccessLevel
from backend.auth import UserRoles
from backend.chat.model import Message, Thread  # noqa: F401
from backend.developer import DeveloperProfileService
from backend.developer.access import QuestionAccessService
from backend.question import Status
from backend.question_access import QuestionAccessAdapter
from backend.question_access.model import QuestionAccess


@pytest.fixture
def fake_user_manager():
    return FakeUserManager()


@pytest.fixture
def mocked_storage():
    return FakeStorage()


@pytest.fixture
def developer_profile_service(db_session, fake_user_manager, mocked_storage):
    return DeveloperProfileService(
        session=db_session,
        storage=mocked_storage,
        user_manager=fake_user_manager,  # type: ignore[arg-type]
    )


@pytest.fixture
def question_access(db_session, developer_profile_service):
    return QuestionAccessService(
        QuestionAccessAdapter(db_session),
        developer_profile_service,
    )


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

    decision = await question_access.has_access_by_id(
        owned_question.owner.id, str(owned_question.question.id), level
    )

    assert decision.allowed is True
    assert decision.reason == "Question access granted"


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

    decision = await question_access.has_access_by_id(
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
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.TEACHER.value)]

    with pytest.raises(PermissionError, match="Developer access requires"):
        await question_access.has_access_by_id(
            owned_question.requester.id, owned_question.question.id, level
        )


@pytest.mark.asyncio
async def test_question_owner_gets_owner_access(
    question_access,
    owned_question,
    fake_user_manager,
) -> None:
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]
    access = await question_access.get_access_by_id(
        owned_question.owner.id,
        owned_question.question.id,
    )

    assert access is not None
    assert access.question_id == owned_question.question.id
    assert access.developer_id == owned_question.owner_profile.id
    assert access.access_level == AccessLevel.OWNER


@pytest.mark.asyncio
async def test_published_question_grants_view_access_without_shared_access(
    question_access,
    fake_user_manager,
    owned_question,
) -> None:
    fake_user_manager.user = owned_question.requester
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]
    owned_question.question.status = Status.PUBLISHED

    decision = await question_access.has_access_by_id(
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.VIEW,
    )

    assert decision.allowed is True
    assert decision.reason == "Question public view access granted"


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
    qaccess = await question_access.grant_access_by_id(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        level,
    )
    assert qaccess.question_id == owned_question.question.id
    assert qaccess.developer_id == owned_question.requester_profile.id
    assert qaccess.access_level == level

    decision = await question_access.has_access_by_id(
        owned_question.requester.id, owned_question.question.id, level
    )
    assert decision.allowed is True


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
    qaccess = await question_access.grant_access_by_id(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.VIEW,
    )
    updated = await question_access.update_access_by_id(
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

    qaccess = await question_access.grant_access_by_id(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.FULL,
    )

    await question_access.revoke_access_by_id(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
    )

    stored_access = db_session.exec(
        select(QuestionAccess).where(QuestionAccess.id == qaccess.id)
    ).first()
    assert stored_access is None

    decision = await question_access.has_access_by_id(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert decision.allowed is False
    assert decision.reason == "Question access does not exist"
