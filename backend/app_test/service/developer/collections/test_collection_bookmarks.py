import pytest
from sqlmodel import Session

from app_test.support.developer import DeveloperActor
from backend.developer.collections.bookmarks import CollectionBookmarkService
from backend.developer.collections.service import DeveloperCollectionService
from backend.question.collections import QuestionCollectionNotFoundError
from backend.question.collections.models import Status


@pytest.mark.asyncio
async def test_bookmarks_can_be_added_listed_and_removed(
    db_session: Session,
    developer_collection_service: DeveloperCollectionService,
    dev_owner: DeveloperActor,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Published collection",
    )
    await developer_collection_service.update_collection(
        dev_owner.user,
        collection.id,
        title=None,
        status=Status.PUBLISHED,
    )
    bookmarks = CollectionBookmarkService(db_session)

    assert await bookmarks.add_bookmark(dev_owner.user.id, collection.id)
    assert await bookmarks.add_bookmark(dev_owner.user.id, collection.id)
    listed = await bookmarks.list_bookmarks(dev_owner.user.id)
    assert [item.id for item in listed] == [collection.id]

    assert await bookmarks.remove_bookmark(dev_owner.user.id, collection.id)
    assert await bookmarks.remove_bookmark(dev_owner.user.id, collection.id)
    assert await bookmarks.list_bookmarks(dev_owner.user.id) == []


@pytest.mark.asyncio
async def test_only_published_collections_can_be_bookmarked(
    db_session: Session,
    developer_collection_service: DeveloperCollectionService,
    dev_owner: DeveloperActor,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Draft collection",
    )

    with pytest.raises(QuestionCollectionNotFoundError):
        await CollectionBookmarkService(db_session).add_bookmark(
            dev_owner.user.id,
            collection.id,
        )
