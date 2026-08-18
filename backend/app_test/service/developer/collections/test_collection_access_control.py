import pytest

from backend.developer.exceptions import DeveloperAccessDenied


@pytest.mark.asyncio
async def test_other_cannot_view_collection(
    developer_collection_service,
    collection_owner,
    collection_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        collection_owner.user,
        title="Private Collection",
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.get_collection(
            collection_other.user,
            collection.id,
        )


@pytest.mark.asyncio
async def test_other_cannot_update_collection(
    developer_collection_service,
    question_collection_service,
    collection_owner,
    collection_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        collection_owner.user,
        title="Original Title",
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.update_collection(
            collection_other.user,
            collection.id,
            title="Other User Edit",
        )

    persisted = question_collection_service.get_collection(collection.id)
    assert persisted.title == "Original Title"


@pytest.mark.asyncio
async def test_other_cannot_add_question_to_collection(
    developer_collection_service,
    question_collection_service,
    collection_owner,
    collection_other,
    make_question,
) -> None:
    collection = await developer_collection_service.create_collection(
        collection_owner.user,
        title="Private Collection",
    )
    question = make_question(collection_other.profile, title="Other User Question")

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.add_question(
            collection_other.user,
            collection.id,
            question.id,
        )

    assert await question_collection_service.get_questions_for_collections(collection.id) == []


@pytest.mark.asyncio
async def test_other_cannot_remove_question_from_collection(
    developer_collection_service,
    question_collection_service,
    collection_owner_with_question,
    collection_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        collection_owner_with_question.user,
        title="Private Collection",
    )
    question = collection_owner_with_question.question
    await developer_collection_service.add_question(
        collection_owner_with_question.user,
        collection.id,
        question.id,
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.remove_question(
            collection_other.user,
            collection.id,
            question.id,
        )

    questions = await question_collection_service.get_questions_for_collections(collection.id)
    assert [existing.id for existing in questions] == [question.id]


@pytest.mark.asyncio
async def test_other_cannot_delete_collection(
    developer_collection_service,
    question_collection_service,
    collection_owner,
    collection_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        collection_owner.user,
        title="Private Collection",
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.delete_collection(
            collection_other.user,
            collection.id,
        )

    assert question_collection_service.get_collection(collection.id).id == collection.id
