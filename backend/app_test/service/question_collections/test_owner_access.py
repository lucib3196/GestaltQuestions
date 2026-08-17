import pytest

from backend.question_collections import QuestionCollectionValidationError
from backend.question_collections.exceptions import QuestionCollectionDeleteError


@pytest.mark.asyncio
async def test_create_child_collection_raises_when_parent_belongs_to_other_profile(
    question_collection_service,
    creator,
    other,
) -> None:
    parent = await question_collection_service.create_collection(
        creator.profile,
        title="Creator Parent",
    )

    with pytest.raises(QuestionCollectionValidationError):
        await question_collection_service.create_collection(
            other.profile,
            title="Other Child",
            parent=parent,
        )


@pytest.mark.asyncio
async def test_update_collection_raises_when_collection_belongs_to_other_profile(
    question_collection_service,
    creator,
    other,
) -> None:
    collection = await question_collection_service.create_collection(
        creator.profile,
        title="Creator Collection",
    )

    with pytest.raises(QuestionCollectionValidationError):
        await question_collection_service.update_collection(
            other.profile,
            collection,
            title="Other Update",
        )

    unchanged = question_collection_service.get_collection(collection.id)
    assert unchanged.title == "Creator Collection"


@pytest.mark.asyncio
async def test_delete_collection_raises_when_collection_belongs_to_other_profile(
    question_collection_service,
    creator,
    other,
) -> None:
    collection = await question_collection_service.create_collection(
        creator.profile,
        title="Creator Collection",
    )

    with pytest.raises(QuestionCollectionDeleteError):
        await question_collection_service.delete_collection(
            other.profile,
            collection,
        )

    assert question_collection_service.get_collection(collection.id).id == collection.id
