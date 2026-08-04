from typing import Annotated

from fastapi import Depends

from backend.access_policy import RoleAccessPolicy
from backend.api.dependencies import QuestionManagerDependency
from backend.api.dependencies.core import SessionDep
from backend.api.dependencies.storage import StorageDependency
from backend.api.dependencies.users import UserManagerDependeny
from backend.auth import UserRoles
from backend.developer import DeveloperQuestionService
from backend.developer.services import DeveloperProfileService
from backend.question_access import QuestionAccessService


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


def get_question_access(
    session: SessionDep, policy: DeveloperRoleAccess
) -> QuestionAccessService:
    return QuestionAccessService(session, policy)


QuestionAccessDependency = Annotated[
    QuestionAccessService, Depends(get_question_access)
]


def get_dev_question_manager(
    session: SessionDep,
    qm: QuestionManagerDependency,
    profile: DeveloperProfileDependency,
    question_access: QuestionAccessDependency,
) -> DeveloperQuestionService:
    return DeveloperQuestionService(session, qm, profile, question_access)


DevQManager = Annotated[DeveloperQuestionService, Depends(get_dev_question_manager)]
