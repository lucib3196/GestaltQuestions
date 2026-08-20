import pytest


@pytest.mark.asyncio
async def test_inherited_access_level(
    developer_collection_service,
    collection_sharing,
    make_question,
    dev_owner,
    dev_other,
    developer_question_access,
):
    collection = await developer_collection_service.create_collection(
        dev_owner.user, title="SharedCollection"
    )
    question1 = make_question(dev_owner.profile, title="Question1")
    question2 = make_question(dev_owner.profile, title="Question2")
    collection_sharing.share_with_user()
    
