from typing import Literal

import pytest

from backend.authorization import AccessLevel
from backend.developer.collections import DeveloperCollectionService
from backend.question.collections import QuestionCollectionService
from backend.developer.exceptions import DeveloperAccessDenied


# Utility
async def run_collection_action(
    developer_collection_service: DeveloperCollectionService,
    action: Literal[
        "get_collection",
        "update_collection",
        "delete_collection",
        "add_question",
        "remove_question",
    ],
    user_id,
    collection_id,
    question_id=None,
):
    if action == "get_collection":
        return await developer_collection_service.get_collection(
            user_id,
            collection_id,
        )

    if action == "update_collection":
        return await developer_collection_service.update_collection(
            user_id,
            collection_id,
            title="Updated Collection",
        )
    if action == "delete_collection":
        return await developer_collection_service.delete_collection(
            user_id, collection_id
        )
    if action == "add_question":
        return await developer_collection_service.add_question(
            user_id, collection_id, question_id
        )
    if action == "remove_question":
        return await developer_collection_service.remove_question(
            user_id, collection_id, question_id
        )

    raise ValueError(f"Unknown action: {action}")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("level", "action", "allowed"),
    [
        (AccessLevel.VIEW, "get_collection", True),
        (AccessLevel.VIEW, "update_collection", False),
        (AccessLevel.VIEW, "delete_collection", False),
        (AccessLevel.EDIT, "get_collection", True),
        (AccessLevel.EDIT, "update_collection", False),
        (AccessLevel.EDIT, "delete_collection", False),
        (AccessLevel.FULL, "get_collection", True),
        (AccessLevel.FULL, "update_collection", True),
        (AccessLevel.FULL, "delete_collection", False),
    ],
)
async def test_shared_collection_access_level_controls_collection_actions(
    collection_sharing,
    developer_collection_service: DeveloperCollectionService,
    dev_owner,
    dev_other,
    level,
    action,
    allowed,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user.id,
        "SharedCollection",
    )
    await collection_sharing.share_with_user(
        dev_owner.user.id,
        dev_other.user.id,
        collection.id,
        level=level,
    )

    if allowed:
        await run_collection_action(
            developer_collection_service,
            action,
            dev_other.user.id,
            collection.id,
        )
    else:
        with pytest.raises(DeveloperAccessDenied):
            await run_collection_action(
                developer_collection_service,
                action,
                dev_other.user.id,
                collection.id,
            )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("level", "action", "allowed"),
    [
        (AccessLevel.VIEW, "add_question", False),
        (AccessLevel.VIEW, "remove_question", False),
        (AccessLevel.EDIT, "add_question", True),
        (AccessLevel.EDIT, "remove_question", True),
        (AccessLevel.FULL, "add_question", True),
        (AccessLevel.FULL, "remove_question", True),
    ],
)
async def test_shared_collection_access_level_controls_question_actions(
    collection_sharing,
    developer_collection_service: DeveloperCollectionService,
    question_collection_service: QuestionCollectionService,
    dev_owner,
    dev_other,
    make_question,
    level,
    action,
    allowed,
) -> None:
    collection = await developer_collection_service.create_collection(
        dev_owner.user.id,
        "SharedCollection",
    )
    question = make_question(dev_owner.profile, title="Shared Question")

    await collection_sharing.share_with_user(
        dev_owner.user.id,
        dev_other.user.id,
        collection.id,
        level=level,
    )

    if action == "remove_question":
        await developer_collection_service.add_question(
            dev_owner.user.id,
            collection.id,
            question.id,
        )

    if allowed:
        await run_collection_action(
            developer_collection_service,
            action,
            dev_other.user.id,
            collection.id,
            question.id,
        )
    else:
        with pytest.raises(DeveloperAccessDenied):
            await run_collection_action(
                developer_collection_service,
                action,
                dev_other.user.id,
                collection.id,
                question.id,
            )

    questions = question_collection_service.get_questions_in_collection(collection)
    question_ids = [existing.id for existing in questions]

    if action == "add_question":
        assert (question.id in question_ids) is allowed

    if action == "remove_question":
        assert (question.id not in question_ids) is allowed
