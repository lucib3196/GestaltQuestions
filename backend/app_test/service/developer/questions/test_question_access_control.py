from types import SimpleNamespace

import pytest
from sqlmodel import select

from backend.authorization import AccessLevel
from backend.chat.model import Message, Thread  # noqa: F401
from backend.question import Status
from backend.question.access.models import QuestionAccess


@pytest.fixture
def owned_question(dev_owner, dev_other, make_question):
    question = make_question(owner=dev_owner.profile)

    return SimpleNamespace(
        owner=dev_owner.user,
        owner_profile=dev_owner.profile,
        requester=dev_other.user,
        requester_profile=dev_other.profile,
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
    developer_question_access,
    owned_question,
    level,
) -> None:
    decision = await developer_question_access.has_access(
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
    developer_question_access,
    owned_question,
    level,
) -> None:
    decision = await developer_question_access.has_access(
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
    developer_question_access,
    owned_question,
    student_user,
    level,
) -> None:
    with pytest.raises(PermissionError, match="Developer access requires"):
        await developer_question_access.has_access(
            student_user.id, owned_question.question.id, level
        )


@pytest.mark.asyncio
async def test_question_owner_gets_owner_access(
    developer_question_access,
    owned_question,
) -> None:
    result = await developer_question_access.check_access(
        owned_question.owner.id,
        owned_question.question.id,
    )
    access = result.access

    assert access is not None
    assert access.question_id == owned_question.question.id
    assert access.developer_id == owned_question.owner_profile.id
    assert access.access_level == AccessLevel.OWNER


@pytest.mark.asyncio
async def test_published_question_grants_view_access_without_shared_access(
    developer_question_access,
    owned_question,
) -> None:
    owned_question.question.status = Status.PUBLISHED

    decision = await developer_question_access.has_access(
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
    developer_question_access,
    owned_question,
    level,
) -> None:
    qaccess = await developer_question_access.grant_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        level,
    )
    assert qaccess.question_id == owned_question.question.id
    assert qaccess.developer_id == owned_question.requester_profile.id
    assert qaccess.access_level == level

    decision = await developer_question_access.has_access(
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
async def test_update_access(developer_question_access, owned_question, level) -> None:
    qaccess = await developer_question_access.grant_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.VIEW,
    )
    updated = await developer_question_access.update_access(
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
    developer_question_access,
    owned_question,
) -> None:
    qaccess = await developer_question_access.grant_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
        AccessLevel.FULL,
    )

    await developer_question_access.revoke_access(
        owned_question.owner.id,
        owned_question.requester.id,
        owned_question.question.id,
    )

    stored_access = db_session.exec(
        select(QuestionAccess).where(QuestionAccess.id == qaccess.id)
    ).first()
    assert stored_access is None

    decision = await developer_question_access.has_access(
        owned_question.requester.id,
        owned_question.question.id,
    )

    assert decision.allowed is False
    assert decision.reason == "Question access does not exist"
