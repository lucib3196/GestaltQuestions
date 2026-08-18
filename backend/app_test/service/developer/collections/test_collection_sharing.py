import pytest


@pytest.mark.asyncio
def test_(collection_sharing, make_developer_profile_service):
    dev = make_developer_profile_service()
    print("Dev, dev")


