from dataclasses import dataclass

import pytest

from backend.accounts import Role, User, UserRoles
from backend.developer import (
    DeveloperCollectionService,
    DeveloperProfile,
    DeveloperProfileService,
)
from backend.developer.collections import CollectionSharing
from backend.developer.collections.access import (
    QuestionCollectionAccessService,
    QuestionCollectionAccessReader,
)
from backend.developer.questions import DeveloperQuestionService
from backend.developer.questions.access import QuestionAccessService
from backend.developer.questions.sharing import QuestionSharing
from backend.question import Question
from backend.question.access import QuestionAccessAdapter

# Actor test data


@dataclass(frozen=True)
class DeveloperActor:
    user: User
    profile: DeveloperProfile


@dataclass(frozen=True)
class DeveloperWithQuestion(DeveloperActor):
    question: Question


@pytest.fixture
def dev_owner(make_user, make_developer_profile) -> DeveloperActor:
    user = make_user(
        email="collection-owner@email.com",
        roles=[Role(name=UserRoles.DEVELOPER.value)],
    )
    profile = make_developer_profile(user)
    return DeveloperActor(user=user, profile=profile)


@pytest.fixture
def dev_other(make_user, make_developer_profile) -> DeveloperActor:
    user = make_user(
        email="collection-other@email.com",
        roles=[Role(name=UserRoles.DEVELOPER.value)],
    )
    profile = make_developer_profile(user)
    return DeveloperActor(user=user, profile=profile)


@pytest.fixture
def dev_owner_with_question(
    dev_owner,
    make_question,
) -> DeveloperWithQuestion:
    question = make_question(dev_owner.profile, title="Question")
    return DeveloperWithQuestion(
        user=dev_owner.user,
        profile=dev_owner.profile,
        question=question,
    )


# Developer profile services


@pytest.fixture
def developer_profile_service(
    make_developer_profile_service,
) -> DeveloperProfileService:
    return make_developer_profile_service()


# Collection services


@pytest.fixture
def collection_access(
    question_collection_adapter,
    developer_profile_service,
) -> QuestionCollectionAccessService:
    return QuestionCollectionAccessService(
        adapter=question_collection_adapter,
        profile_service=developer_profile_service,
    )


@pytest.fixture
def developer_collection_service(
    developer_profile_service,
    collection_access,
    question_collection_service,
) -> DeveloperCollectionService:
    return DeveloperCollectionService(
        profile_service=developer_profile_service,
        collections=question_collection_service,
        collection_access=collection_access,
    )


@pytest.fixture
def collection_sharing(collection_access) -> CollectionSharing:
    return CollectionSharing(access_service=collection_access)


# Question access services


@pytest.fixture
def question_adapter(db_session) -> QuestionAccessAdapter:
    return QuestionAccessAdapter(db_session)


@pytest.fixture
def collection_access_reader(db_session) -> QuestionCollectionAccessReader:
    return QuestionCollectionAccessReader(db_session)


@pytest.fixture
def developer_question_access(
    developer_profile_service, question_adapter, collection_access_reader
) -> QuestionAccessService:
    return QuestionAccessService(
        adapter=question_adapter,
        profile_service=developer_profile_service,
        access_reader=collection_access_reader,
    )


@pytest.fixture
def developer_question_service(
    db_session, question_manager, developer_profile_service, developer_question_access
) -> DeveloperQuestionService:
    return DeveloperQuestionService(
        db_session,
        question_manager,
        developer_profile_service,
        developer_question_access,
    )


@pytest.fixture
def developer_question_sharing(developer_question_access) -> QuestionSharing:
    return QuestionSharing(developer_question_access)
