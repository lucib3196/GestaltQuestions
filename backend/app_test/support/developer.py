from dataclasses import dataclass

import pytest
from sqlmodel import Session

from app_test.factories.developer_factory import (
    MakeDeveloperProfile,
    MakeDeveloperProfileService,
)
from app_test.factories.question_factory import MakeQuestion
from app_test.factories.user_factory import MakeUser
from backend.accounts import Role, User, UserRoles
from backend.developer import (
    DeveloperCollectionService,
    DeveloperProfile,
    DeveloperProfileService,
)
from backend.developer.collections import (
    CollectionSharing,
    DeveloperCollectionAuthorizer,
    QuestionCollectionAccessReader,
    QuestionCollectionAccessService,
)
from backend.developer.questions import DeveloperQuestionService
from backend.developer.questions.access import QuestionAccessService
from backend.developer.questions.authorizer import DeveloperQuestionAuthorizer
from backend.developer.questions.sharing import QuestionSharing
from backend.question import Question
from backend.question.access import QuestionAccessAdapter
from backend.question.collections import (
    QuestionCollectionAdapter,
    QuestionCollectionService,
)
from backend.question.manager.services.manager import QuestionManager

# Actor test data


@dataclass(frozen=True)
class DeveloperActor:
    user: User
    profile: DeveloperProfile


@dataclass(frozen=True)
class DeveloperWithQuestion(DeveloperActor):
    question: Question


@pytest.fixture
def dev_owner(
    make_user: MakeUser,
    make_developer_profile: MakeDeveloperProfile,
) -> DeveloperActor:
    user = make_user(
        email="collection-owner@email.com",
        roles=[Role(name=UserRoles.DEVELOPER.value)],
    )
    profile = make_developer_profile(user)
    return DeveloperActor(user=user, profile=profile)


@pytest.fixture
def dev_other(
    make_user: MakeUser,
    make_developer_profile: MakeDeveloperProfile,
) -> DeveloperActor:
    user = make_user(
        email="collection-other@email.com",
        roles=[Role(name=UserRoles.DEVELOPER.value)],
    )
    profile = make_developer_profile(user)
    return DeveloperActor(user=user, profile=profile)


@pytest.fixture
def dev_owner_with_question(
    dev_owner: DeveloperActor,
    make_question: MakeQuestion,
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
    make_developer_profile_service: MakeDeveloperProfileService,
) -> DeveloperProfileService:
    return make_developer_profile_service()


# Collection services


@pytest.fixture
def collection_access(
    question_collection_adapter: QuestionCollectionAdapter,
    developer_profile_service: DeveloperProfileService,
) -> QuestionCollectionAccessService:
    return QuestionCollectionAccessService(
        adapter=question_collection_adapter,
        profile_service=developer_profile_service,
    )


@pytest.fixture
def developer_collection_service(
    developer_profile_service: DeveloperProfileService,
    collection_access: QuestionCollectionAccessService,
    question_collection_service: QuestionCollectionService[DeveloperProfile],
) -> DeveloperCollectionService:
    return DeveloperCollectionService(
        authorizer=DeveloperCollectionAuthorizer(
            collection_access=collection_access, profile=developer_profile_service
        ),
        collections=question_collection_service,
    )


@pytest.fixture
def collection_sharing(
    collection_access: QuestionCollectionAccessService,
) -> CollectionSharing:
    return CollectionSharing(access_service=collection_access)


# Question access services


@pytest.fixture
def question_adapter(db_session: Session) -> QuestionAccessAdapter:
    return QuestionAccessAdapter(db_session)


@pytest.fixture
def collection_access_reader(db_session: Session) -> QuestionCollectionAccessReader:
    return QuestionCollectionAccessReader(db_session)


@pytest.fixture
def developer_question_access(
    developer_profile_service: DeveloperProfileService,
    question_adapter: QuestionAccessAdapter,
    collection_access_reader: QuestionCollectionAccessReader,
) -> QuestionAccessService:
    return QuestionAccessService(
        adapter=question_adapter,
        profile_service=developer_profile_service,
        access_reader=collection_access_reader,
    )


@pytest.fixture
def developer_question_service(
    db_session: Session,
    question_manager: QuestionManager,
    developer_profile_service: DeveloperProfileService,
    developer_question_access: QuestionAccessService,
) -> DeveloperQuestionService:
    return DeveloperQuestionService(
        db_session,
        question_manager,
        developer_profile_service,
        authorizer=DeveloperQuestionAuthorizer(
            developer_question_access,
            developer_profile_service,
        ),
    )


@pytest.fixture
def developer_question_sharing(
    developer_question_access: QuestionAccessService,
) -> QuestionSharing:
    return QuestionSharing(developer_question_access)
