from typing import Annotated

from fastapi import Depends

from backend.access_policy import RoleAccessPolicy
from backend.auth import UserRoles
from backend.developer.services import DeveloperProfileService
from backend.question_access import QuestionAccessService
from backend.question_manager import DeveloperQuestionService

from .core import SessionDep
from .questions import QuestionManagerDependency
from .storage import StorageDependency
from .users import UserManagerDependeny


def get_developer_role_access(
    user_manager: UserManagerDependeny,
) -> RoleAccessPolicy:
    return RoleAccessPolicy(
        user_manager=user_manager,
        allowed_roles=[UserRoles.DEVELOPER, UserRoles.STUDENT],
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


def get_question_control(
    session: SessionDep,
    access: DeveloperRoleAccess,
) -> QuestionAccessService:
    return QuestionAccessService(session=session, policy=access)


QuestionControlDependency = Annotated[
    QuestionAccessService,
    Depends(get_question_control),
]


def get_dev_question_manager(
    session: SessionDep,
    qm: QuestionManagerDependency,
    developer_profiles: DeveloperProfileDependency,
    question_control: QuestionControlDependency,
) -> DeveloperQuestionService:
    return DeveloperQuestionService(
        session=session,
        developer_profiles=developer_profiles,
        question_control=question_control,
        question_manager=qm,
    )


DeveloperQuestionManagerDependency = Annotated[
    DeveloperQuestionService, Depends(get_dev_question_manager)
]

__all__ = [
    "DeveloperProfileDependency",
    "DeveloperQuestionManagerDependency",
    "DeveloperRoleAccess",
    "QuestionControlDependency",
    "get_dev_question_manager",
    "get_developer_profile_service",
    "get_developer_role_access",
    "get_question_control",
]
