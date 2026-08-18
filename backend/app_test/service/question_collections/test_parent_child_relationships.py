import pytest


@pytest.mark.asyncio
async def test_create_collection_with_parent(
    question_collection_service, collection_owner
) -> None:
    profile = collection_owner.profile
    parent = await question_collection_service.create_collection(
        profile, title="ParentCollection"
    )

    child = await question_collection_service.create_collection(
        profile, title="ChildCollection", parent=parent
    )

    assert child.parent == parent
    assert child.parent_id == parent.id


@pytest.mark.asyncio
async def test_update_collection_can_move_collection_under_parent(
    question_collection_service,
    collection_owner,
) -> None:
    child = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Child",
    )
    parent = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Parent",
    )

    updated = await question_collection_service.update_collection(
        collection_owner.profile,
        child,
        parent=parent,
    )

    assert updated.id == child.id
    assert updated.parent_id == parent.id
    assert updated.parent.id == parent.id
    assert question_collection_service.reconstruct_path(updated) == "Parent->Child"


@pytest.mark.asyncio
async def test_create_collection_with_parent_adds_child_to_parent(
    question_collection_service,
    collection_owner,
) -> None:
    parent = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Parent",
    )

    child = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Child",
        parent=parent,
    )

    assert child.parent_id == parent.id
    assert child.parent.id == parent.id
    assert child in parent.children
    assert question_collection_service.reconstruct_path(child) == "Parent->Child"


@pytest.mark.asyncio
async def test_update_collection_can_remove_parent(
    question_collection_service,
    collection_owner,
) -> None:
    parent = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Parent",
    )
    child = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Child",
        parent=parent,
    )

    updated = await question_collection_service.update_collection(
        collection_owner.profile,
        child,
        parent=None,
    )

    assert updated.parent_id is None
    assert updated.parent is None
    assert question_collection_service.reconstruct_path(updated) == "Child"


@pytest.mark.asyncio
async def test_update_collection_title_does_not_remove_existing_parent(
    question_collection_service,
    collection_owner,
) -> None:
    parent = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Parent",
    )
    child = await question_collection_service.create_collection(
        collection_owner.profile,
        title="Child",
        parent=parent,
    )

    updated = await question_collection_service.update_collection(
        collection_owner.profile,
        child,
        title="Updated Child",
    )

    assert updated.title == "Updated Child"
    assert updated.parent_id == parent.id
    assert (
        question_collection_service.reconstruct_path(updated) == "Parent->Updated Child"
    )
