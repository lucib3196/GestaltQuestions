from backend.question_collections.service.question_collection_service import (
    QuestionCollectionService,
)
from backend.question_collections.schema import QuestionCollectionCreate
import pytest
from uuid import uuid4
from backend.auth.model import DeveloperProfile, User


@pytest.fixture
def developer_profile(db_session) -> DeveloperProfile:
    user = User(
        first_name="Test",
        last_name="Developer",
        username="test-dev",
        email="test-dev@example.com",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = DeveloperProfile(
        user_id=user.id,
        storage_path=f"test/developers/{user.id}/",
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)

    return profile


@pytest.fixture
def service(db_session) -> QuestionCollectionService:
    return QuestionCollectionService(session=db_session)


@pytest.mark.parametrize(
    "title,parent_title",
    [
        ("MyFolder", None),
        ("Physics", "Week1"),
        ("Practice Problems", "Week2"),
    ],
)
def test_create(
    service: QuestionCollectionService,
    developer_profile: DeveloperProfile,
    title: str,
    parent_title: str | None,
):
    parent_id = None

    if parent_title:
        parent = service.create(
            data=QuestionCollectionCreate(
                owner_id=developer_profile.id,
                title=parent_title,
            )
        )
        parent_id = parent.id

    collection = service.create(
        data=QuestionCollectionCreate(
            owner_id=developer_profile.id,
            title=title,
            parent_id=parent_id,
        )
    )

    assert collection
    assert collection.owner_id == developer_profile.id
    assert collection.title == title
    assert collection.parent_id == parent_id

    print(collection)
