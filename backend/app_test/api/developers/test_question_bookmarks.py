import pytest
from fastapi.testclient import TestClient

from app_test.factories.question_factory import MakeQuestion
from app_test.factories.user_factory import MakeUser
from app_test.support.developer import DeveloperActor
from backend.accounts import User
from backend.api.dependencies.users import get_current_user_id
from backend.question import Status


@pytest.mark.asyncio
async def test_any_signed_in_user_can_bookmark_a_published_question(
    api_client: TestClient,
    dev_owner: DeveloperActor,
    make_user: MakeUser,
    make_question: MakeQuestion,
) -> None:
    regular_user = make_user()
    question = make_question(dev_owner.profile, status=Status.PUBLISHED)
    make_question(
        dev_owner.profile,
        title="Other published question",
        status=Status.PUBLISHED,
    )
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        regular_user.id
    )

    add_response = api_client.put(
        f"/developer/questions/{question.id}/bookmark"
    )
    list_response = api_client.get("/developer/questions/bookmarks")

    assert add_response.status_code == 200
    assert add_response.json() is True
    assert list_response.status_code == 200
    assert list_response.json() == [str(question.id)]
    bookmarked_search = api_client.post(
        "/developer/tables/questions/published/search",
        json={"question_ids": list_response.json()},
    )
    assert bookmarked_search.status_code == 200
    assert [row["question_id"] for row in bookmarked_search.json()] == [
        str(question.id)
    ]

    remove_response = api_client.delete(
        f"/developer/questions/{question.id}/bookmark"
    )

    assert remove_response.status_code == 200
    assert remove_response.json() is True
    assert api_client.get("/developer/questions/bookmarks").json() == []


@pytest.mark.asyncio
async def test_unpublished_question_cannot_be_bookmarked(
    api_client: TestClient,
    dev_owner: DeveloperActor,
    make_user: MakeUser,
    make_question: MakeQuestion,
) -> None:
    regular_user: User = make_user()
    question = make_question(dev_owner.profile, status=Status.DRAFT)
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        regular_user.id
    )

    response = api_client.put(f"/developer/questions/{question.id}/bookmark")

    assert response.status_code == 404
