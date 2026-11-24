import pytest
from fastapi.testclient import TestClient

from app_test.factories.user_factory import MakeUser
from app_test.support.developer import DeveloperActor
from backend.api.dependencies.users import get_current_user_id
from backend.developer.collections.service import DeveloperCollectionService
from backend.question.collections.models import Status


def test_public_collection_search_returns_empty_list_when_none_are_published(
    api_client: TestClient,
    dev_owner: DeveloperActor,
) -> None:
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        dev_owner.user.id
    )

    response = api_client.get("/developer/collections/public/search")

    assert response.status_code == 200
    assert response.json() == []


def test_collection_bookmarks_returns_empty_list_when_none_are_saved(
    api_client: TestClient,
    dev_owner: DeveloperActor,
) -> None:
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        dev_owner.user.id
    )

    response = api_client.get("/developer/collections/bookmarks")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_non_developer_can_bookmark_published_collection(
    api_client: TestClient,
    dev_owner: DeveloperActor,
    make_user: MakeUser,
    developer_collection_service: DeveloperCollectionService,
) -> None:
    regular_user = make_user()
    published_collection = await developer_collection_service.create_collection(
        dev_owner.user,
        "Public collection",
    )
    await developer_collection_service.update_collection(
        dev_owner.user,
        published_collection.id,
        title=None,
        status=Status.PUBLISHED,
    )
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        regular_user.id
    )

    add_response = api_client.put(
        f"/developer/collections/{published_collection.id}/bookmark"
    )
    list_response = api_client.get("/developer/collections/bookmarks")

    assert add_response.status_code == 200
    assert add_response.json() is True
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [
        str(published_collection.id)
    ]
