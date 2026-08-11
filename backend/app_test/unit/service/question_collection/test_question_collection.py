import pytest

from app_test.shared.factories import (  # noqa: F401
    make_developer_profile,
    make_question,
    make_user,
)
from backend.developer import DeveloperProfile
from backend.question_collections import (
    QuestionCollection,
    QuestionCollectionNotFoundError,
    QuestionCollectionService,
    QuestionCollectionValidationError,
)


@pytest.fixture
def owner_profile(make_user, make_developer_profile) -> DeveloperProfile:
    return make_developer_profile(make_user())


@pytest.fixture
def other_owner_profile(make_user, make_developer_profile) -> DeveloperProfile:
    return make_developer_profile(make_user())


@pytest.fixture
def question_collection_service(
    db_session,
) -> QuestionCollectionService[DeveloperProfile]:
    return QuestionCollectionService[DeveloperProfile](session=db_session)


@pytest.mark.asyncio
async def test_create_collection_persists_title_and_owner(
    question_collection_service: QuestionCollectionService[DeveloperProfile],
    owner_profile: DeveloperProfile,
) -> None:
    collection = await question_collection_service.create_collection(
        owner_profile,
        title="Physics",
    )

    assert isinstance(collection, QuestionCollection)
    assert collection.id is not None
    assert collection.title == "Physics"
    assert collection.owner_id == owner_profile.id
    assert collection.parent_id is None


@pytest.mark.asyncio
async def test_create_collection_with_parent_sets_parent_id(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
) -> None:
    parent = await question_collection_service.create_collection(
        owner_profile,
        title="Mechanics",
    )

    child = await question_collection_service.create_collection(
        owner_profile,
        title="Dynamics",
        parent=parent,
    )

    assert child.parent_id == parent.id
    assert question_collection_service.reconstruct_path(child) == "Mechanics->Dynamics"


def test_get_collection_by_owner_returns_only_owned_collection(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
    other_owner_profile: DeveloperProfile,
) -> None:
    other_collection = QuestionCollection(
        title="Other Owner Collection",
        owner_id=other_owner_profile.id,
    )

    question_collection_service._session.add(other_collection)
    question_collection_service._session.commit()
    question_collection_service._session.refresh(other_collection)

    result = question_collection_service.get_collection_by_owner(
        owner_profile,
        other_collection.id,
    )

    assert result is None


@pytest.mark.asyncio
async def test_update_collection_changes_title_and_parent(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
) -> None:
    collection = await question_collection_service.create_collection(
        owner_profile,
        title="Draft",
    )
    parent = await question_collection_service.create_collection(
        owner_profile,
        title="Published",
    )

    updated = await question_collection_service.update_collection(
        owner_profile,
        collection.id,
        title="Week 1",
        parent=parent,
    )

    assert updated.title == "Week 1"
    assert updated.parent_id == parent.id


@pytest.mark.asyncio
async def test_update_collection_rejects_self_as_parent(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
) -> None:
    collection = await question_collection_service.create_collection(
        owner_profile,
        title="Physics",
    )

    with pytest.raises(QuestionCollectionValidationError):
        await question_collection_service.update_collection(
            owner_profile,
            collection.id,
            parent=collection,
        )


@pytest.mark.asyncio
async def test_create_collection_rejects_parent_owned_by_another_profile(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
    other_owner_profile: DeveloperProfile,
) -> None:
    other_parent = await question_collection_service.create_collection(
        other_owner_profile,
        title="Other Parent",
    )

    with pytest.raises(QuestionCollectionValidationError):
        await question_collection_service.create_collection(
            owner_profile,
            title="Child",
            parent=other_parent,
        )


@pytest.mark.asyncio
async def test_delete_collection_removes_owned_collection(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
) -> None:
    collection = await question_collection_service.create_collection(
        owner_profile,
        title="Archive",
    )

    deleted = await question_collection_service.delete_collection(
        owner_profile,
        collection.id,
    )

    assert deleted is True
    assert question_collection_service.get_collection(collection.id) is None


@pytest.mark.asyncio
async def test_delete_collection_raises_when_not_owned(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
    other_owner_profile: DeveloperProfile,
) -> None:
    other_collection = await question_collection_service.create_collection(
        other_owner_profile,
        title="Other Collection",
    )

    with pytest.raises(QuestionCollectionNotFoundError):
        await question_collection_service.delete_collection(
            owner_profile,
            other_collection.id,
        )


@pytest.mark.asyncio
async def test_get_all_questions_returns_questions_added_to_collection(
    question_collection_service: QuestionCollectionService,
    owner_profile: DeveloperProfile,
    make_question,
) -> None:
    collection = await question_collection_service.create_collection(
        owner_profile,
        title="Physics",
    )
    question_1 = make_question(owner=owner_profile, title="Newton's Laws")
    question_2 = make_question(owner=owner_profile, title="Energy")
    unrelated_question = make_question(owner=owner_profile, title="Not in collection")

    await question_collection_service.add_question(collection.id, question_1.id)
    await question_collection_service.add_question(collection.id, question_2.id)

    result = await question_collection_service.get_all_questions(collection.id)
    result_ids = {question.id for question in result}

    assert result_ids == {question_1.id, question_2.id}
    assert unrelated_question.id not in result_ids
