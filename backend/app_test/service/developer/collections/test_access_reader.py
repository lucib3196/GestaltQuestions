import pytest
import pytest_asyncio

from backend.authorization import AccessLevel
from backend.developer.collections import DeveloperCollectionService


@pytest_asyncio.fixture()
async def collection_question(
    developer_collection_service: DeveloperCollectionService,
    dev_owner,
    make_question,
):
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Collection with question",
    )
    question = make_question()

    await developer_collection_service.add_question(
        dev_owner.user,
        collection.id,
        question,
    )

    return collection, question


@pytest.mark.asyncio
async def test_owner_gets_owner_access_through_question_collection(
    collection_access_reader,
    collection_question,
    dev_owner,
) -> None:
    _, question = collection_question

    access = collection_access_reader.get_access_for_question_in_collection(
        question,
        dev_owner.profile,
    )

    assert access is not None
    assert access.access_level == AccessLevel.OWNER


@pytest.mark.asyncio
async def test_developer_without_collection_access_gets_no_question_access(
    collection_access_reader,
    collection_question,
    dev_other,
) -> None:
    _, question = collection_question

    access = collection_access_reader.get_access_for_question_in_collection(
        question,
        dev_other.profile,
    )

    assert access is None


@pytest.mark.asyncio
async def test_reader_returns_shared_collection_access_for_question(
    collection_access_reader,
    collection_sharing,
    collection_question,
    dev_owner,
    dev_other,
) -> None:
    collection, question = collection_question

    await collection_sharing.share_with_user(
        dev_owner.profile,
        dev_other.profile,
        collection,
        level=AccessLevel.VIEW,
    )

    access = collection_access_reader.get_access_for_question_in_collection(
        question,
        dev_other.profile,
    )

    assert access is not None
    assert access.access_level == AccessLevel.VIEW


@pytest.mark.asyncio
async def test_reader_ignores_access_to_collection_that_does_not_contain_question(
    collection_access_reader,
    collection_sharing,
    collection_question,
    developer_collection_service,
    dev_owner,
    dev_other,
) -> None:
    _, question = collection_question
    unrelated_collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Unrelated collection",
    )

    await collection_sharing.share_with_user(
        dev_owner.profile,
        dev_other.profile,
        unrelated_collection,
        level=AccessLevel.FULL,
    )

    access = collection_access_reader.get_access_for_question_in_collection(
        question,
        dev_other.profile,
    )

    assert access is None


@pytest.mark.asyncio
async def test_reader_returns_highest_access_when_question_is_in_multiple_collections(
    collection_access_reader,
    collection_sharing,
    collection_question,
    developer_collection_service,
    dev_owner,
    dev_other,
) -> None:
    view_collection, question = collection_question
    full_collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Higher access collection",
    )

    await developer_collection_service.add_question(
        dev_owner.user,
        full_collection.id,
        question,
    )
    await collection_sharing.share_with_user(
        dev_owner.profile,
        dev_other.profile,
        view_collection,
        level=AccessLevel.VIEW,
    )
    await collection_sharing.share_with_user(
        dev_owner.profile,
        dev_other.profile,
        full_collection,
        level=AccessLevel.FULL,
    )

    access = collection_access_reader.get_access_for_question_in_collection(
        question,
        dev_other.profile,
    )

    assert access is not None
    assert access.access_level == AccessLevel.FULL
