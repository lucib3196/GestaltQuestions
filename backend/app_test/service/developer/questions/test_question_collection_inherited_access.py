import pytest


@pytest.mark.asyncio
async def test_user(dev_owner, collection_other, user_manager) -> None:
    user_id = dev_owner.user.id

    print("User", dev_owner.user.roles)

    roles = await user_manager.get_user_role(user_id)
    print(roles)

    print("Other ", await user_manager.get_user_role(collection_other.user.id))
