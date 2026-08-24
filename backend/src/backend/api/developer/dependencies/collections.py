from typing import Annotated

from fastapi import Depends

from backend.api.dependencies.core import SessionDep
from backend.developer import DeveloperCollectionService
from backend.developer.collections.access import (
    QuestionCollectionAccessReader,
    QuestionCollectionAccessService,
)
from backend.developer.collections.authorizer import DeveloperCollectionAuthorizer
from backend.question.collections import (
    QuestionCollectionAdapter,
    QuestionCollectionService,
)

from .profiles import DeveloperProfileDependency


def get_question_collection_service(session: SessionDep) -> QuestionCollectionService:
    return QuestionCollectionService(session)


QuestionCollectionServiceDependency = Annotated[
    QuestionCollectionService,
    Depends(get_question_collection_service),
]


def get_question_collection_access_reader(
    session: SessionDep,
) -> QuestionCollectionAccessReader:
    return QuestionCollectionAccessReader(session)


QuestionCollectionAccessReaderDependency = Annotated[
    QuestionCollectionAccessReader,
    Depends(get_question_collection_access_reader),
]


def get_question_collection_access_adapter(
    session: SessionDep,
) -> QuestionCollectionAdapter:
    return QuestionCollectionAdapter(session)


QuestionCollectionAccessAdapterDependency = Annotated[
    QuestionCollectionAdapter,
    Depends(get_question_collection_access_adapter),
]


def get_question_collection_access(
    adapter: QuestionCollectionAccessAdapterDependency,
    profile: DeveloperProfileDependency,
) -> QuestionCollectionAccessService:
    return QuestionCollectionAccessService(adapter, profile)


QuestionCollectionAccessDependency = Annotated[
    QuestionCollectionAccessService,
    Depends(get_question_collection_access),
]


def get_developer_collection_authorizer(
    collection_access: QuestionCollectionAccessDependency,
    profile: DeveloperProfileDependency,
) -> DeveloperCollectionAuthorizer:
    return DeveloperCollectionAuthorizer(
        collection_access=collection_access,
        profile=profile,
    )


CollectionAuthorizer = Annotated[
    DeveloperCollectionAuthorizer,
    Depends(get_developer_collection_authorizer),
]


def get_dev_collection_manager(
    collections: QuestionCollectionServiceDependency,
    authorizer: CollectionAuthorizer,
) -> DeveloperCollectionService:
    return DeveloperCollectionService(
        collections=collections,
        authorizer=authorizer,
    )


DevCollectionManager = Annotated[
    DeveloperCollectionService,
    Depends(get_dev_collection_manager),
]
