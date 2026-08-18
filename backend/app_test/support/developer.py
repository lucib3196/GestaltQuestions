import pytest
from backend.developer.access import QuestionCollectionAccessService
from sqlmodel import Session

from app_test.fakes import FakeStorage, FakeUserManager
from backend.accounts import UserRoles
from backend.developer import DeveloperCollectionService, DeveloperProfileService


@pytest.fixture
def developer_profile_service(
    db_session: Session,
) -> DeveloperProfileService:
    user_manager = FakeUserManager()
    user_manager.roles = [UserRoles.DEVELOPER]
    return DeveloperProfileService(
        session=db_session,
        storage=FakeStorage(),  # type: ignore[arg-type]
        user_manager=user_manager,  # type: ignore[arg-type]
    )


@pytest.fixture
def collection_access(
    question_collection_adapter, developer_profile_service
) -> QuestionCollectionAccessService:
    return QuestionCollectionAccessService(
        adapter=question_collection_adapter, profile_service=developer_profile_service
    )


@pytest.fixture
def developer_collection_service(
    developer_profile_service, collection_access, question_collection_service
) -> DeveloperCollectionService:
    return DeveloperCollectionService(
        profile_service=developer_profile_service,
        collections=question_collection_service,
        collection_access=collection_access,
    )
