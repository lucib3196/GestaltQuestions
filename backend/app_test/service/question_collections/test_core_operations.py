import pytest

from backend.question_collections import QuestionCollection


@pytest.mark.asyncio
@pytest.mark.parametrize("title", ["Physics", "Math", "Engineering"])
async def test_create_collection(question_collection_service, title, collection_owner) -> None:
    profile = collection_owner.profile
    collection = await question_collection_service.create_collection(profile, title)

    assert isinstance(collection, QuestionCollection)
    assert collection.title == title
    assert collection.owner_id == profile.id
    assert collection.parent_id is None


@pytest.mark.asyncio
@pytest.mark.parametrize("title", ["Physics", "Math", "Engineering"])
async def test_update_collection(question_collection_service, title, collection_owner) -> None:
    profile = collection_owner.profile
    collection = await question_collection_service.create_collection(
        profile, title="OriginalTitle"
    )

    updated = await question_collection_service.update_collection(
        profile, collection, title=title
    )

    assert isinstance(updated, QuestionCollection)
    assert updated.id == collection.id
    assert updated.title == title
    assert collection.updated_at <= updated.updated_at
    assert collection.created_at == updated.created_at
