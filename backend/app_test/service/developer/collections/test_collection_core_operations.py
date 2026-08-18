import pytest

from backend.authorization import AccessLevel
from backend.question_collections import (
    QuestionCollection,
    QuestionCollectionNotFoundError,
)


@pytest.mark.asyncio
@pytest.mark.parametrize("title", ["Physics", "Math", "Engineering"])
async def test_create_collection(
    developer_collection_service, dev_owner, title
) -> None:
    user = dev_owner.user
    profile = dev_owner.profile
    collection = await developer_collection_service.create_collection(user, title)

    assert isinstance(collection, QuestionCollection)
    assert collection.title == title
    assert collection.owner_id == profile.id
    assert collection.parent_id is None


@pytest.mark.asyncio
@pytest.mark.parametrize("title", ["Physics", "Math", "Engineering"])
async def test_update_collection(
    developer_collection_service, title, dev_owner
) -> None:
    user = dev_owner.user
    collection = await developer_collection_service.create_collection(
        user, title="OriginalTitle"
    )
    print("Created collection", collection)

    updated = await developer_collection_service.update_collection(
        user, collection.id, title=title
    )

    assert isinstance(updated, QuestionCollection)
    assert updated.id == collection.id
    assert updated.title == title
    assert collection.updated_at <= updated.updated_at
    assert collection.created_at == updated.created_at


@pytest.mark.asyncio
async def test_add_question(
    developer_collection_service, dev_owner_with_question
) -> None:
    user = dev_owner_with_question.user
    question = dev_owner_with_question.question
    collection = await developer_collection_service.create_collection(
        user, title="MyCollection"
    )

    link = await developer_collection_service.add_question(
        user, collection.id, question.id
    )

    assert link.collection_id == collection.id
    assert link.question_id == question.id


@pytest.mark.asyncio
async def test_remove_question(
    developer_collection_service,
    question_collection_service,
    dev_owner_with_question,
) -> None:
    user = dev_owner_with_question.user
    question = dev_owner_with_question.question
    collection = await developer_collection_service.create_collection(
        user, title="MyCollection"
    )
    await developer_collection_service.add_question(user, collection.id, question.id)

    removed = await developer_collection_service.remove_question(
        user, collection.id, question.id
    )

    assert removed is True
    assert await question_collection_service.get_questions_for_collections(collection.id) == []


@pytest.mark.asyncio
async def test_delete_collection(
    developer_collection_service,
    question_collection_service,
    dev_owner,
) -> None:
    user = dev_owner.user
    collection = await developer_collection_service.create_collection(
        user, title="MyCollection"
    )

    deleted = await developer_collection_service.delete_collection(user, collection.id)

    assert deleted is True
    with pytest.raises(QuestionCollectionNotFoundError):
        question_collection_service.get_collection(collection.id)


@pytest.mark.asyncio
async def test_check_access(developer_collection_service, dev_owner) -> None:
    user = dev_owner.user
    collection = await developer_collection_service.create_collection(
        user, "MyCollection"
    )

    access_decision = await developer_collection_service.check_access(
        user, collection.id
    )
    assert access_decision.access.access_level == AccessLevel.OWNER
