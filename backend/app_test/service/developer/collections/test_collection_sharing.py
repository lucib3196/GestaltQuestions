import pytest

from backend.authorization import AccessLevel
from backend.authorization.profiles.exceptions import ProfileAccessDenied
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
async def test_grant_access_denied_for_non_developers(
    collection_sharing, developer_collection_service, dev_owner, student_user
) -> None:
    owner_user_id = dev_owner.user.id
    collection = await developer_collection_service.create_collection(
        owner_user_id, "SharedCollection"
    )
    with pytest.raises(ProfileAccessDenied) as exc:
        await collection_sharing.share_with_user(
            dev_owner.user.id,
            student_user.id,
            collection.id,
            level=AccessLevel.VIEW,
        )
        print(exc, "Exception")


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_grant_access_allows_requester_to_access_shared_collection(
    collection_sharing,
    developer_collection_service,
    dev_owner,
    dev_other,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    collection = await developer_collection_service.create_collection(
        owner_user_id, "SharedCollection"
    )

    access_before_sharing = await developer_collection_service.check_access(
        requester_user_id, collection.id
    )
    assert access_before_sharing.allowed is False

    shared_access = await collection_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        collection.id,
        level=level,
    )

    assert shared_access.collection_id == collection.id
    assert shared_access.developer_id == dev_other.profile.id
    assert shared_access.granted_by_id == dev_owner.profile.id
    assert shared_access.access_level == level

    access_after_sharing = await developer_collection_service.check_access(
        requester_user_id, collection.id
    )
    assert access_after_sharing.allowed is True


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_update_access_changes_existing_shared_access_level(
    collection_sharing,
    developer_collection_service,
    dev_owner,
    dev_other,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    collection = await developer_collection_service.create_collection(
        owner_user_id, "SharedCollection"
    )
    await collection_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        collection.id,
        level=AccessLevel.VIEW,
    )

    updated_access = await collection_sharing.update_user_access(
        owner_user_id,
        requester_user_id,
        collection.id,
        level=level,
    )

    assert updated_access.collection_id == collection.id
    assert updated_access.developer_id == dev_other.profile.id
    assert updated_access.granted_by_id == dev_owner.profile.id
    assert updated_access.access_level == level


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_revoke_access_removes_requester_access_to_shared_collection(
    collection_sharing,
    developer_collection_service,
    dev_owner,
    dev_other,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    collection = await developer_collection_service.create_collection(
        owner_user_id, "SharedCollection"
    )
    await collection_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        collection.id,
        level=level,
    )

    access_before_revoke = await developer_collection_service.check_access(
        requester_user_id, collection.id
    )
    assert access_before_revoke.allowed is True

    await collection_sharing.unshare_with_user(
        owner_user_id,
        requester_user_id,
        collection.id,
    )

    access_after_revoke = await developer_collection_service.check_access(
        requester_user_id, collection.id
    )
    assert access_after_revoke.allowed is False


@pytest.mark.asyncio
async def test_non_owner_cannot_share_collection(
    collection_sharing,
    developer_collection_service,
    dev_owner,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user.id,
        "SharedCollection",
    )

    with pytest.raises(ResourceAccessDenied):
        await collection_sharing.share_with_user(
            dev_other.user.id,
            dev_owner.user.id,
            collection.id,
            level=AccessLevel.VIEW,
        )


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_list_shared_with_me_includes_shared_collection_access(
    collection_sharing,
    developer_collection_service,
    dev_owner,
    dev_other,
    level,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    collection = await developer_collection_service.create_collection(
        owner_user_id, "SharedCollection"
    )
    await collection_sharing.share_with_user(
        owner_user_id,
        requester_user_id,
        collection.id,
        level=level,
    )

    shared_with_requester = await collection_sharing.list_shared_with_me(
        requester_user_id
    )

    shared_access = next(
        access
        for access in shared_with_requester
        if access.collection_id == collection.id
    )
    assert shared_access.developer_id == dev_other.profile.id
    assert shared_access.granted_by_id == dev_owner.profile.id
    assert shared_access.access_level == level


@pytest.mark.asyncio
@pytest.mark.parametrize("grant_action", ["share", "update"])
async def test_owner_access_level_cannot_be_granted_to_another_user(
    collection_sharing,
    developer_collection_service,
    dev_owner,
    dev_other,
    grant_action,
) -> None:
    owner_user_id = dev_owner.user.id
    requester_user_id = dev_other.user.id

    collection = await developer_collection_service.create_collection(
        owner_user_id, "SharedCollection"
    )

    if grant_action == "update":
        await collection_sharing.share_with_user(
            owner_user_id,
            requester_user_id,
            collection.id,
            level=AccessLevel.VIEW,
        )

        with pytest.raises(ResourceAccessValidationError):
            await collection_sharing.update_user_access(
                owner_user_id,
                requester_user_id,
                collection.id,
                level=AccessLevel.OWNER,
            )
    else:
        with pytest.raises(ResourceAccessValidationError):
            await collection_sharing.share_with_user(
                owner_user_id,
                requester_user_id,
                collection.id,
                level=AccessLevel.OWNER,
            )

    requester_access = await developer_collection_service.check_access(
        requester_user_id,
        collection.id,
    )

    if grant_action == "update":
        assert requester_access.access.access_level == AccessLevel.VIEW
    else:
        assert requester_access.allowed is False
