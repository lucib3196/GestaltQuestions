import pytest

from backend.question.collections import QuestionCollectionValidationError
from backend.question.collections.exceptions import QuestionCollectionDeleteError


@pytest.mark.asyncio
async def test_create_child_collection_raises_when_parent_belongs_to_dev_other_profile(
    question_collection_service,
    dev_owner,
    dev_other,
) -> None:
    parent = await question_collection_service.create_collection(
        dev_owner.profile,
        title="Creator Parent",
    )

    with pytest.raises(QuestionCollectionValidationError):
        await question_collection_service.create_collection(
            dev_other.profile,
            title="Other Child",
            parent=parent,
        )


@pytest.mark.asyncio
async def test_delete_collection_raises_when_collection_belongs_to_dev_other_profile(
    question_collection_service,
    dev_owner,
    dev_other,
) -> None:
    collection = await question_collection_service.create_collection(
        dev_owner.profile,
        title="Creator Collection",
    )

    with pytest.raises(QuestionCollectionDeleteError):
        await question_collection_service.delete_collection(
            dev_other.profile,
            collection,
        )

    assert question_collection_service.get_collection(collection.id).id == collection.id
