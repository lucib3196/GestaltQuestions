import pytest


from backend.authorization import AccessLevel

SHAREABLE_ACCESS_LEVELS = [
    AccessLevel.VIEW,
    AccessLevel.EDIT,
    AccessLevel.FULL,
]


@pytest.mark.asyncio
@pytest.mark.parametrize("level", SHAREABLE_ACCESS_LEVELS)
async def test_question_access_inherits_shared_collection(
    make_shared_collection_question, developer_question_access, level
) -> None:
    shared = await make_shared_collection_question(level=level)
    target_user = shared.target.profile
    question = shared.question

    access = await developer_question_access.retrieve_access(
        target_user,
        shared.question,
    )

    assert access is not None
    assert access.question_id == question.id
    assert access.developer_id == target_user.id
    assert access.access_level == level


# @pytest.mark.asyncio
# async def test_inherited_access_level(
#     developer_collection_service,
#     collection_sharing,
#     make_question,
#     dev_owner,
#     dev_other,
#     developer_question_access,
# ):
#     collection = await developer_collection_service.create_collection(
#         dev_owner.user, title="SharedCollection"
#     )
#     question1 = make_question(dev_owner.profile, title="Question1")
#     question2 = make_question(dev_owner.profile, title="Question2")
#     await developer_collection_service.add_question(
#         dev_owner.user, collection.id, question1
#     )
#     await collection_sharing.share_with_user(
#         dev_owner.profile, dev_other.profile, collection, "view"
#     )
#     access = await developer_question_access.retrieve_access(
#         dev_other.profile, question1
#     )
#     print("Access", access)
#     access2 = await developer_question_access.retrieve_access(
#         dev_other.profile, question2
#     )
#     print("Access", access2)
