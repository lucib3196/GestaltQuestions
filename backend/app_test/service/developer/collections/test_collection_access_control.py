import pytest

from backend.developer.collections import DeveloperCollectionService
from backend.developer.exceptions import DeveloperAccessDenied
from backend.question.collections import QuestionCollectionService
from backend.question.collections.models import Status


@pytest.mark.asyncio
async def test_other_cannot_view_collection(
    developer_collection_service: DeveloperCollectionService,
    dev_owner,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Private Collection",
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.get_collection(
            dev_other.user,
            collection.id,
        )


@pytest.mark.asyncio
async def test_other_can_view_published_collection(
    developer_collection_service: DeveloperCollectionService,
    dev_owner_with_question,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner_with_question.user,
        title="Public Collection",
    )
    await developer_collection_service.add_question(
        dev_owner_with_question.user,
        collection.id,
        dev_owner_with_question.question.id,
    )
    await developer_collection_service.update_collection(
        dev_owner_with_question.user,
        collection.id,
        title=None,
        status=Status.PUBLISHED,
    )

    detail = await developer_collection_service.get_collection(
        dev_other.user,
        collection.id,
    )
    questions = await developer_collection_service.get_questions_in_collection(
        dev_other.user,
        collection.id,
    )

    assert detail.id == collection.id
    assert detail.status == Status.PUBLISHED
    assert [question.id for question in questions] == [
        dev_owner_with_question.question.id
    ]


@pytest.mark.asyncio
async def test_published_collection_remains_read_only(
    developer_collection_service: DeveloperCollectionService,
    dev_owner,
    dev_other,
    make_question,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Public Collection",
    )
    await developer_collection_service.update_collection(
        dev_owner.user,
        collection.id,
        title=None,
        status=Status.PUBLISHED,
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.update_collection(
            dev_other.user,
            collection.id,
            title="Changed",
        )

    question = make_question(dev_other.profile, title="Question")
    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.add_question(
            dev_other.user,
            collection.id,
            question.id,
        )


@pytest.mark.asyncio
async def test_other_cannot_update_collection(
    developer_collection_service: DeveloperCollectionService,
    question_collection_service,
    dev_owner,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Original Title",
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.update_collection(
            dev_other.user,
            collection.id,
            title="Other User Edit",
        )

    persisted = question_collection_service.get_collection(collection.id)
    assert persisted.title == "Original Title"


@pytest.mark.asyncio
async def test_other_cannot_add_question_to_collection(
    developer_collection_service: DeveloperCollectionService,
    question_collection_service: QuestionCollectionService,
    dev_owner,
    dev_other,
    make_question,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Private Collection",
    )
    question = make_question(dev_other.profile, title="Other User Question")

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.add_question(
            dev_other.user,
            collection.id,
            question.id,
        )

    assert question_collection_service.get_questions_in_collection(collection) == []


@pytest.mark.asyncio
async def test_other_cannot_get_questions_in_collection(
    developer_collection_service: DeveloperCollectionService,
    dev_owner_with_question,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner_with_question.user,
        title="Private Collection",
    )
    question = dev_owner_with_question.question
    await developer_collection_service.add_question(
        dev_owner_with_question.user,
        collection.id,
        question.id,
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.get_questions_in_collection(
            dev_other.user,
            collection.id,
        )


@pytest.mark.asyncio
async def test_other_cannot_remove_question_from_collection(
    developer_collection_service: DeveloperCollectionService,
    question_collection_service: QuestionCollectionService,
    dev_owner_with_question,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner_with_question.user,
        title="Private Collection",
    )
    question = dev_owner_with_question.question
    await developer_collection_service.add_question(
        dev_owner_with_question.user,
        collection.id,
        question.id,
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.remove_question(
            dev_other.user,
            collection.id,
            question.id,
        )

    questions = question_collection_service.get_questions_in_collection(collection)
    assert [existing.id for existing in questions] == [question.id]


@pytest.mark.asyncio
async def test_other_cannot_delete_collection(
    developer_collection_service,
    question_collection_service,
    dev_owner,
    dev_other,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Private Collection",
    )

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.delete_collection(
            dev_other.user,
            collection.id,
        )

    assert question_collection_service.get_collection(collection.id).id == collection.id
