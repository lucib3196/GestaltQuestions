from types import SimpleNamespace

import pytest

from app_test.shared.factories import (  # noqa: F401
    make_developer_profile,
    make_question,
    make_user,
)
from app_test.shared.fakes import FakeStorage, FakeUserManager
from backend.auth import User, UserRoles
from backend.developer import DeveloperCollectionService
from backend.developer.access import QuestionCollectionAccessService
from backend.developer.exceptions import DeveloperAccessDenied
from backend.developer.services.developer_profile_service import DeveloperProfileService
from backend.question_collections import (
    QuestionCollection,
    QuestionCollectionAdapter,
    QuestionCollectionService,
)


@pytest.fixture
def fake_user_manager() -> FakeUserManager:
    return FakeUserManager()


@pytest.fixture
def developer_profile_service(
    db_session,
    fake_user_manager: FakeUserManager,
) -> DeveloperProfileService:
    return DeveloperProfileService(
        session=db_session,
        storage=FakeStorage(),
        user_manager=fake_user_manager,  # type: ignore[arg-type]
    )


@pytest.fixture
def question_collection_service(db_session) -> QuestionCollectionService:
    return QuestionCollectionService(session=db_session)


@pytest.fixture
def question_collection_access(
    db_session,
    developer_profile_service: DeveloperProfileService,
) -> QuestionCollectionAccessService:
    return QuestionCollectionAccessService(
        QuestionCollectionAdapter(db_session),
        developer_profile_service,
    )


@pytest.fixture
def developer_collection_service(
    developer_profile_service: DeveloperProfileService,
    question_collection_service: QuestionCollectionService,
    question_collection_access: QuestionCollectionAccessService,
) -> DeveloperCollectionService:
    return DeveloperCollectionService(
        developer_profiles=developer_profile_service,
        collections=question_collection_service,
        collection_access=question_collection_access,
    )


@pytest.fixture
def owner(make_user, make_developer_profile) -> SimpleNamespace:
    user = make_user(email="collection-owner@example.com")
    profile = make_developer_profile(user)
    return SimpleNamespace(user=user, profile=profile)


@pytest.fixture
def requester(make_user, make_developer_profile) -> SimpleNamespace:
    user = make_user(email="collection-requester@example.com")
    profile = make_developer_profile(user)
    return SimpleNamespace(user=user, profile=profile)


def set_developer_user(
    fake_user_manager: FakeUserManager,
    user: User,
) -> None:
    fake_user_manager.user = user
    fake_user_manager.roles = [SimpleNamespace(name=UserRoles.DEVELOPER.value)]


@pytest.mark.asyncio
async def test_create_collection_creates_collection_for_developer_profile(
    developer_collection_service: DeveloperCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
) -> None:
    set_developer_user(fake_user_manager, owner.user)

    collection = await developer_collection_service.create_collection(
        owner.user.id,
        title="Physics",
    )

    assert isinstance(collection, QuestionCollection)
    assert collection.title == "Physics"
    assert collection.owner_id == owner.profile.id
    assert collection.parent_id is None


@pytest.mark.asyncio
async def test_create_collection_with_parent_requires_parent_access(
    developer_collection_service: DeveloperCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
) -> None:
    set_developer_user(fake_user_manager, owner.user)
    parent = await developer_collection_service.create_collection(
        owner.user.id,
        title="Mechanics",
    )

    child = await developer_collection_service.create_collection(
        owner.user.id,
        title="Dynamics",
        parent_id=parent.id,
    )

    assert child.owner_id == owner.profile.id
    assert child.parent_id == parent.id


@pytest.mark.asyncio
async def test_get_collection_returns_collection_when_developer_has_access(
    developer_collection_service: DeveloperCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
) -> None:
    set_developer_user(fake_user_manager, owner.user)
    collection = await developer_collection_service.create_collection(
        owner.user.id,
        title="Thermodynamics",
    )

    result = await developer_collection_service.get_collection(
        owner.user.id,
        collection.id,
    )

    assert result.id == collection.id
    assert result.title == "Thermodynamics"


@pytest.mark.asyncio
async def test_get_collection_raises_when_developer_lacks_access(
    developer_collection_service: DeveloperCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
    requester: SimpleNamespace,
) -> None:
    set_developer_user(fake_user_manager, owner.user)
    collection = await developer_collection_service.create_collection(
        owner.user.id,
        title="Private Collection",
    )

    set_developer_user(fake_user_manager, requester.user)

    with pytest.raises(DeveloperAccessDenied):
        await developer_collection_service.get_collection(
            requester.user.id,
            collection.id,
        )


@pytest.mark.asyncio
async def test_update_collection_updates_owned_collection(
    developer_collection_service: DeveloperCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
) -> None:
    set_developer_user(fake_user_manager, owner.user)
    collection = await developer_collection_service.create_collection(
        owner.user.id,
        title="Draft",
    )

    updated = await developer_collection_service.update_collection(
        owner.user.id,
        collection.id,
        title="Week 1",
    )

    assert updated.id == collection.id
    assert updated.title == "Week 1"


@pytest.mark.asyncio
async def test_delete_collection_deletes_owned_collection(
    developer_collection_service: DeveloperCollectionService,
    question_collection_service: QuestionCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
) -> None:
    set_developer_user(fake_user_manager, owner.user)
    collection = await developer_collection_service.create_collection(
        owner.user.id,
        title="Archive",
    )

    deleted = await developer_collection_service.delete_collection(
        owner.user.id,
        collection.id,
    )

    assert deleted is True
    assert question_collection_service.get_collection(collection.id) is None


@pytest.mark.asyncio
async def test_get_all_questions_returns_questions_for_accessible_collection(
    developer_collection_service: DeveloperCollectionService,
    fake_user_manager: FakeUserManager,
    owner: SimpleNamespace,
    make_question,
) -> None:
    set_developer_user(fake_user_manager, owner.user)
    collection = await developer_collection_service.create_collection(
        owner.user.id,
        title="Practice",
    )
    question_1 = make_question(owner=owner.profile, title="Kinematics")
    question_2 = make_question(owner=owner.profile, title="Forces")

    await developer_collection_service.add_question(
        owner.user.id,
        collection.id,
        question_1.id,
    )
    await developer_collection_service.add_question(
        owner.user.id,
        collection.id,
        question_2.id,
    )

    result = await developer_collection_service.get_all_questions(
        owner.user.id,
        collection.id,
    )

    assert {question.id for question in result} == {question_1.id, question_2.id}
