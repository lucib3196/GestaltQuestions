from dataclasses import dataclass
from typing import Protocol

import pytest

from app_test.factories.question_factory import MakeQuestion
from app_test.support.developer import DeveloperActor
from backend.authorization import AccessLevel
from backend.developer.collections import CollectionSharing, DeveloperCollectionService
from backend.question import Question
from backend.question.collections import QuestionCollection


@dataclass(frozen=True)
class SharedCollectionQuestion:
    owner: DeveloperActor
    target: DeveloperActor
    collection: QuestionCollection
    question: Question


class MakeSharedCollectionQuestion(Protocol):
    async def __call__(
        self,
        *,
        owner: DeveloperActor | None = None,
        target: DeveloperActor | None = None,
        level: AccessLevel = AccessLevel.VIEW,
        collection_title: str = "SharedCollection",
        question_title: str = "SharedQuestion",
    ) -> SharedCollectionQuestion: ...


@pytest.fixture
def make_shared_collection_question(
    developer_collection_service: DeveloperCollectionService,
    collection_sharing: CollectionSharing,
    dev_owner: DeveloperActor,
    dev_other: DeveloperActor,
    make_question: MakeQuestion,
) -> MakeSharedCollectionQuestion:
    async def make(
        *,
        owner: DeveloperActor | None = None,
        target: DeveloperActor | None = None,
        level: AccessLevel = AccessLevel.VIEW,
        collection_title: str = "SharedCollection",
        question_title: str = "SharedQuestion",
    ) -> SharedCollectionQuestion:
        resolved_owner = owner or dev_owner
        resolved_target = target or dev_other

        collection = await developer_collection_service.create_collection(
            resolved_owner.user.id,
            title=collection_title,
        )
        question = make_question(resolved_owner.profile, title=question_title)

        await developer_collection_service.add_question(
            resolved_owner.user.id,
            collection.id,
            question.id,
        )

        await collection_sharing.share_with_user(
            resolved_owner.user.id,
            resolved_target.user.id,
            collection.id,
            level,
        )
        return SharedCollectionQuestion(
            owner=resolved_owner,
            target=resolved_target,
            collection=collection,
            question=question,
        )

    return make
