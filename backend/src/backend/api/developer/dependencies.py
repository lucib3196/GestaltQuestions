from typing import Annotated

from backend.developer.collections.access import (
    QuestionCollectionAccessService,
)
from backend.developer.questions.access import QuestionAccessService

from fastapi import Depends

from backend.accounts.users import UserLookup
from backend.api.dependencies import QuestionManagerDependency
from backend.api.dependencies.core import SessionDep
from backend.api.dependencies.storage import StorageDependency
from backend.api.dependencies.users import UserManagerDependeny
from backend.authorization import RoleAccessPolicy
from backend.authorization.roles import UserRoles
from backend.developer import DeveloperCollectionService, DeveloperQuestionService
from backend.developer.profiles import DeveloperProfileService
from backend.developer.questions import DeveloperTables
from backend.question_access import QuestionAccessAdapter
from backend.question_collections import (
    QuestionCollectionAdapter,
    QuestionCollectionService,
)
from backend.question_views.service.table_query_service import TableQueryService


def get_developer_role_access(user_manager: UserManagerDependeny) -> RoleAccessPolicy:
    return RoleAccessPolicy(
        user_manager=user_manager,
        allowed_roles=[UserRoles.DEVELOPER],
        access_name="Developer",
    )


DeveloperRoleAccess = Annotated[
    RoleAccessPolicy,
    Depends(get_developer_role_access),
]


def get_user_lookup(session: SessionDep) -> UserLookup:
    return UserLookup(session)


UserLookupDependency = Annotated[
    UserLookup,
    Depends(get_user_lookup),
]


def get_developer_profile_service(
    session: SessionDep,
    storage: StorageDependency,
    user_manager: UserManagerDependeny,
) -> DeveloperProfileService:
    return DeveloperProfileService(
        session=session,
        storage=storage,
        user_manager=user_manager,
    )


DeveloperProfileDependency = Annotated[
    DeveloperProfileService,
    Depends(get_developer_profile_service),
]


def get_question_access_adapter(session: SessionDep) -> QuestionAccessAdapter:
    return QuestionAccessAdapter(session)


QuestionAccessAdapterDependency = Annotated[
    QuestionAccessAdapter,
    Depends(get_question_access_adapter),
]


def get_question_access(
    adapter: QuestionAccessAdapterDependency,
    profile: DeveloperProfileDependency,
) -> QuestionAccessService:
    return QuestionAccessService(adapter, profile)


QuestionAccessDependency = Annotated[
    QuestionAccessService,
    Depends(get_question_access),
]


def get_question_collection_service(session: SessionDep) -> QuestionCollectionService:
    return QuestionCollectionService(session)


QuestionCollectionServiceDependency = Annotated[
    QuestionCollectionService,
    Depends(get_question_collection_service),
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


def get_dev_question_manager(
    session: SessionDep,
    qm: QuestionManagerDependency,
    profile: DeveloperProfileDependency,
    question_access: QuestionAccessDependency,
) -> DeveloperQuestionService:
    return DeveloperQuestionService(session, qm, profile, question_access)


DevQManager = Annotated[
    DeveloperQuestionService,
    Depends(get_dev_question_manager),
]


def get_developer_tables(
    session: SessionDep,
) -> DeveloperTables:
    return DeveloperTables(TableQueryService(session))


DeveloperTablesDependency = Annotated[
    DeveloperTables,
    Depends(get_developer_tables),
]


def get_dev_collection_manager(
    profile: DeveloperProfileDependency,
    collections: QuestionCollectionServiceDependency,
    collection_access: QuestionCollectionAccessDependency,
) -> DeveloperCollectionService:
    return DeveloperCollectionService(
        developer_profiles=profile,
        collections=collections,
        collection_access=collection_access,
    )


DevCollectionManager = Annotated[
    DeveloperCollectionService,
    Depends(get_dev_collection_manager),
]
