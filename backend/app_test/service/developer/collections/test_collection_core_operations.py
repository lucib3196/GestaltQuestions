import pytest

from app_test.factories.question_factory import MakeQuestion
from app_test.support.developer import DeveloperActor
from backend.authorization import AccessLevel
from backend.developer import DeveloperProfile
from backend.developer.collections import DeveloperCollectionService
from backend.question import Status as QuestionStatus
from backend.question.collections import (
    QuestionCollection,
    QuestionCollectionNotFoundError,
    QuestionCollectionService,
)
from backend.question.collections.models import Status as CollectionStatus


@pytest.mark.asyncio
@pytest.mark.parametrize("title", ["Physics", "Math", "Engineering"])
async def test_create_collection(
    developer_collection_service: DeveloperCollectionService, dev_owner, title
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
@pytest.mark.parametrize(
    ("collection_status", "initial_question_status", "expected_question_status"),
    [
        (CollectionStatus.PUBLISHED, QuestionStatus.DRAFT, QuestionStatus.PUBLISHED),
        (CollectionStatus.DRAFT, QuestionStatus.PUBLISHED, QuestionStatus.DRAFT),
    ],
)
async def test_update_collection_status_updates_linked_questions_only(
    developer_collection_service: DeveloperCollectionService,
    question_collection_service: QuestionCollectionService[DeveloperProfile],
    dev_owner: DeveloperActor,
    make_question: MakeQuestion,
    collection_status: CollectionStatus,
    initial_question_status: QuestionStatus,
    expected_question_status: QuestionStatus,
) -> None:
    user = dev_owner.user
    collection = await developer_collection_service.create_collection(
        user, title="Status propagation"
    )
    linked_question = make_question(
        dev_owner.profile,
        title="Linked question",
        status=initial_question_status,
    )
    unrelated_question = make_question(
        dev_owner.profile,
        title="Unrelated question",
        status=QuestionStatus.ARCHIVED,
    )
    await developer_collection_service.add_question(
        user, collection.id, linked_question.id
    )

    await developer_collection_service.update_collection(
        user,
        collection.id,
        title=None,
        status=collection_status,
    )

    updated_linked = question_collection_service.get_question(linked_question.id)
    unchanged_unrelated = question_collection_service.get_question(
        unrelated_question.id
    )
    assert updated_linked.status == expected_question_status
    assert unchanged_unrelated.status == QuestionStatus.ARCHIVED


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
async def test_get_questions_in_collection_returns_added_questions(
    developer_collection_service: DeveloperCollectionService,
    dev_owner,
    make_question,
) -> None:
    user = dev_owner.user
    collection = await developer_collection_service.create_collection(
        user,
        title="Practice",
    )
    question_1 = make_question(dev_owner.profile, title="Question 1")
    question_2 = make_question(dev_owner.profile, title="Question 2")
    unrelated_question = make_question(dev_owner.profile, title="Unrelated")

    await developer_collection_service.add_question(user, collection.id, question_1.id)
    await developer_collection_service.add_question(user, collection.id, question_2.id)

    questions = await developer_collection_service.get_questions_in_collection(
        user,
        collection.id,
    )

    question_ids = {question.id for question in questions}
    assert question_ids == {question_1.id, question_2.id}
    assert unrelated_question.id not in question_ids


@pytest.mark.asyncio
async def test_remove_question(
    developer_collection_service: DeveloperCollectionService,
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
    assert question_collection_service.get_questions_in_collection(collection) == []


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
async def test_search_published_collections_excludes_drafts(
    developer_collection_service: DeveloperCollectionService,
    dev_owner,
    dev_other,
) -> None:
    published = await developer_collection_service.create_collection(
        dev_owner.user,
        title="Published Math",
    )
    await developer_collection_service.update_collection(
        dev_owner.user,
        published.id,
        title=None,
        status=CollectionStatus.PUBLISHED,
    )
    await developer_collection_service.create_collection(
        dev_other.user,
        title="Draft Math",
    )

    results = await developer_collection_service.search_published_collections(
        title="Math",
    )

    assert [collection.id for collection in results] == [published.id]


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
