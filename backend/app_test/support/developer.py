import pytest
from backend.developer.collections.access import QuestionCollectionAccessService
from backend.developer.collections import CollectionSharing
from backend.developer import DeveloperCollectionService, DeveloperProfileService


@pytest.fixture
def developer_profile_service(
    make_developer_profile_service,
) -> DeveloperProfileService:
    return make_developer_profile_service()


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


@pytest.fixture
def collection_sharing(collection_access) -> CollectionSharing:
    return CollectionSharing(access_service=collection_access)
