from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app_test.factories.question_factory import MakeQuestion
from app_test.support.developer import DeveloperActor
from backend.api.dependencies.users import get_current_user_id
from backend.authorization import AccessLevel
from backend.developer.collections.service import DeveloperCollectionService
from backend.question.access import QuestionAccess


@pytest.mark.asyncio
async def test_memberships_are_limited_to_the_viewer_owned_collections(
    api_client: TestClient,
    db_session: Session,
    developer_collection_service: DeveloperCollectionService,
    dev_owner: DeveloperActor,
    dev_other: DeveloperActor,
    make_question: MakeQuestion,
) -> None:
    question = make_question(dev_owner.profile, title="Collection membership question")
    endpoint = f"/developer/questions/{question.id}/collections"
    private_collection = await developer_collection_service.create_collection(
        dev_owner.user, title="Owner's collection"
    )
    await developer_collection_service.add_question(
        dev_owner.user, private_collection.id, question.id
    )
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        dev_other.user.id
    )

    assert api_client.get(endpoint).status_code == 404

    db_session.add(
        QuestionAccess(
            question_id=question.id,
            granted_by_id=dev_owner.profile.id,
            developer_id=dev_other.profile.id,
            access_level=AccessLevel.VIEW,
        )
    )
    db_session.commit()

    empty = api_client.get(endpoint)
    assert empty.status_code == 200
    assert empty.json() == []

    await developer_collection_service.create_collection(dev_other.user, title="Unused")
    expected = []
    for title in ("Statics", "Materials"):
        collection = await developer_collection_service.create_collection(
            dev_other.user, title=title
        )
        await developer_collection_service.add_question(
            dev_other.user, collection.id, question.id
        )
        expected.insert(0, {"id": str(collection.id), "title": title})

    response = api_client.get(endpoint)
    assert response.status_code == 200
    assert response.json() == expected


def test_memberships_for_missing_or_invalid_question(
    api_client: TestClient, dev_owner: DeveloperActor
) -> None:
    api_client.app.dependency_overrides[get_current_user_id] = lambda: str(
        dev_owner.user.id
    )

    assert (
        api_client.get(f"/developer/questions/{uuid4()}/collections").status_code == 404
    )
    assert api_client.get("/developer/questions/invalid/collections").status_code == 422
