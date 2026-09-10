import pytest

from app_test.factories.question_factory import MakeQuestion
from backend.api.dependencies.users import get_current_user_id
from backend.authorization import AccessLevel
from backend.question import Status
from backend.question.access import QuestionAccess


def override_current_user(api_client, user_id) -> None:
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(user_id)


def share_question(db_session, *, question_id, granted_by_id, developer_id) -> None:
    db_session.add(
        QuestionAccess(
            question_id=question_id,
            granted_by_id=granted_by_id,
            developer_id=developer_id,
            access_level=AccessLevel.VIEW,
        )
    )
    db_session.commit()


@pytest.mark.asyncio
async def test_developer_question_table_endpoints_are_active(
    api_client,
    db_session,
    developer_collection_service,
    dev_owner,
    dev_other,
    make_question: MakeQuestion,
) -> None:
    override_current_user(api_client, dev_owner.user.id)

    personal_question = make_question(dev_owner.profile, title="Personal API Question")
    make_question(
        dev_owner.profile,
        title="Published API Question",
        status=Status.PUBLISHED,
    )
    shared_question = make_question(dev_owner.profile, title="Shared API Question")
    collection = await developer_collection_service.create_collection(
        dev_owner.user,
        title="API Collection",
    )
    await developer_collection_service.add_question(
        dev_owner.user,
        collection.id,
        personal_question.id,
    )
    share_question(
        db_session,
        question_id=shared_question.id,
        granted_by_id=dev_owner.profile.id,
        developer_id=dev_other.profile.id,
    )

    endpoints = [
        ("/developer/tables/questions/search", {}),
        (
            "/developer/tables/questions/collections/search",
            {"collection_id": str(collection.id)},
        ),
        ("/developer/tables/questions/published/search", {}),
        ("/developer/tables/questions/shared-by-me/search", {}),
    ]

    for endpoint, payload in endpoints:
        response = api_client.post(endpoint, json=payload)

        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert response.json()

    override_current_user(api_client, dev_other.user.id)
    response = api_client.post(
        "/developer/tables/questions/shared-with-me/search",
        json={},
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()
