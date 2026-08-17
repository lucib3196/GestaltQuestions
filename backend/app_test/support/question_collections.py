from dataclasses import dataclass

import pytest

from backend.auth import User
from backend.developer import (
    DeveloperProfile,
)

from backend.question import Question
from backend.question_collections import (
    QuestionCollectionAdapter,
    QuestionCollectionService,
)


@pytest.fixture
def question_collection_service(
    db_session,
) -> QuestionCollectionService[DeveloperProfile]:
    return QuestionCollectionService(session=db_session)


@pytest.fixture
def question_collection_adapter(db_session) -> QuestionCollectionAdapter:
    return QuestionCollectionAdapter(db_session)


@dataclass(frozen=True)
class CollectionActor:
    user: User
    profile: DeveloperProfile


@dataclass(frozen=True)
class CollectionActorWithQuestion(CollectionActor):
    question: Question


@pytest.fixture
def collection_owner(make_user, make_developer_profile) -> CollectionActor:
    user = make_user(email="collection-owner@email.com")
    profile = make_developer_profile(user)
    return CollectionActor(user=user, profile=profile)


@pytest.fixture
def collection_other(make_user, make_developer_profile) -> CollectionActor:
    user = make_user(email="collection-other@email.com")
    profile = make_developer_profile(user)
    return CollectionActor(user=user, profile=profile)


@pytest.fixture
def collection_owner_with_question(
    collection_owner,
    make_question,
) -> CollectionActorWithQuestion:
    question = make_question(collection_owner.profile, title="Question")
    return CollectionActorWithQuestion(
        user=collection_owner.user,
        profile=collection_owner.profile,
        question=question,
    )
