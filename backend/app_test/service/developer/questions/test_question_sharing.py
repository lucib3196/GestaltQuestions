import pytest

from backend.authorization import AccessLevel
from backend.authorization.profiles import ProfileAccessDenied
from backend.authorization.resources import (
    ResourceAccessDenied,
    ResourceAccessValidationError,
)

SHAREABLE_ACCESS_LEVELS = [
    AccessLevel.VIEW,
    AccessLevel.EDIT,
    AccessLevel.FULL,
]


@pytest.mark.asyncio
async def test_create_question(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    student_user,
    make_question_payload,
) -> None:
    owner_user_id = dev_owner.user.id
    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )
    with pytest.raises(ProfileAccessDenied):
        await developer_question_sharing.share_with_user(
            owner_user_id, student_user.id, question.id, AccessLevel.VIEW
        )


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_grant_access_allows_requester_to_access_shared(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id
    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )
    access_before_sharing = await developer_question_service.check_access(
        requester_user_id, question.id
    )
    assert access_before_sharing.allowed is False
    shared_access = await developer_question_sharing.share_with_user(
        owner_user_id, requester_user_id, question.id, level
    )

    assert shared_access.question_id == question.id
    assert shared_access.developer_id == dev_other.profile.id
    assert shared_access.granted_by_id == dev_owner.profile.id
    assert shared_access.access_level == level

    access_after_sharing = await developer_question_service.check_access(
        requester_user_id, question.id
    )
    assert access_after_sharing.allowed is True


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_update_access_changes_existing_shared_question_access_level(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )

    await developer_question_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        question.id,
        AccessLevel.VIEW,
    )

    updated_access = await developer_question_sharing.update_user_access(
        owner_user_id,
        requester_user_id,
        question.id,
        level,
    )

    assert updated_access.question_id == question.id
    assert updated_access.developer_id == dev_other.profile.id
    assert updated_access.granted_by_id == dev_owner.profile.id
    assert updated_access.access_level == level


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_revoke_access_removes_requester_access_to_shared_question(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )

    await developer_question_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        question.id,
        level,
    )

    access_before_revoke = await developer_question_service.check_access(
        requester_user_id, question.id
    )
    assert access_before_revoke.allowed is True

    await developer_question_sharing.unshare_with_user(
        owner_user_id,
        requester_user_id,
        question.id,
    )

    access_after_revoke = await developer_question_service.check_access(
        requester_user_id, question.id
    )
    assert access_after_revoke.allowed is False


@pytest.mark.asyncio
async def test_non_owner_cannot_share_question(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
) -> None:
    payload = make_question_payload()
    question = await developer_question_service.create_question(
        dev_owner.user.id, payload=payload.question, files=payload.files
    )

    with pytest.raises(ResourceAccessDenied):
        await developer_question_sharing.share_with_user(
            dev_other.user.id,
            dev_owner.user.id,
            question.id,
            AccessLevel.VIEW,
        )


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_list_shared_with_me_includes_shared_question_access(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )

    await developer_question_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        question.id,
        level,
    )

    shared_with_requester = await developer_question_sharing.list_shared_with_me(
        requester_user_id
    )

    shared_access = next(
        access for access in shared_with_requester if access.question_id == question.id
    )
    assert shared_access.developer_id == dev_other.profile.id
    assert shared_access.granted_by_id == dev_owner.profile.id
    assert shared_access.access_level == level


@pytest.mark.asyncio
@pytest.mark.parametrize("grant_action", ["share", "update"])
async def test_owner_access_level_cannot_be_granted_to_another_user(
    developer_question_sharing,
    developer_question_service,
    dev_owner,
    dev_other,
    make_question_payload,
    grant_action,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    payload = make_question_payload()
    question = await developer_question_service.create_question(
        owner_user_id, payload=payload.question, files=payload.files
    )

    if grant_action == "update":
        await developer_question_sharing.share_with_user(
            owner_user_id,
            requester_user_id,
            question.id,
            AccessLevel.VIEW,
        )

        with pytest.raises(ResourceAccessValidationError):
            await developer_question_sharing.update_user_access(
                owner_user_id,
                requester_user_id,
                question.id,
                AccessLevel.OWNER,
            )
    else:
        with pytest.raises(ResourceAccessValidationError):
            await developer_question_sharing.share_with_user(
                owner_user_id,
                requester_user_id,
                question.id,
                AccessLevel.OWNER,
            )

    requester_access = await developer_question_service.check_access(
        requester_user_id,
        question.id,
    )

    if grant_action == "update":
        assert requester_access.access.access_level == AccessLevel.VIEW
    else:
        assert requester_access.allowed is False
