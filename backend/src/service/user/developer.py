from dataclasses import dataclass
from typing import Optional
import re

from sqlmodel import Session, select

from src.app_types.general import ID
from src.model.users import DeveloperProfile, UserRoles
from src.service.question_manager.question_manager import QuestionManager
from src.service.user.user_manager import UserManager
from src.utils.database_utils import convert_uuid
from src.service.storage.base import Storage


class DeveloperAccessDenied(PermissionError):
    """Raised when a user tries to perform a developer-only action."""


@dataclass
class AccessDecision:
    allowed: bool
    reason: str


class DeveloperAccessService:
    """
    Service that gates developer actions and manages developer profile data.
    """

    def __init__(
        self,
        user_manager: UserManager,
        storage: Storage,
        session: Session,
        question_manager: Optional[QuestionManager] = None,
    ):
        self.user_mng = user_manager
        self.session = session
        self.qmng = question_manager
        self.storage = storage

    async def has_developer_role(self, user_id: ID) -> AccessDecision:
        user = await self.user_mng.get_user(user_id)
        if user is None:
            return AccessDecision(False, f"User '{user_id}' not found")

        roles = await self.user_mng.get_user_role(user_id)
        role_names = {r.name.strip().lower() for r in roles}
        if (
            UserRoles.ADMIN.value in role_names
            or UserRoles.DEVELOPER.value in role_names
        ):
            return AccessDecision(True, "Developer access granted")
        return AccessDecision(
            False, "Developer role is required to perform this action"
        )

    async def require_developer_access(self, user_id: ID) -> None:
        access = await self.has_developer_role(user_id)
        if not access.allowed:
            raise DeveloperAccessDenied(access.reason)

    async def get_developer_data(self, user_id: ID) -> DeveloperProfile | None:
        await self.require_developer_access(user_id)
        return self.session.exec(
            select(DeveloperProfile).where(DeveloperProfile.user_id == user_id)
        ).first()

    async def set_developer_data(self, user_id: ID) -> DeveloperProfile:
        try:
            await self.require_developer_access(user_id)
            storage_path = await self.generate_storage_path(user_id)

            dev_profile = self.session.exec(
                select(DeveloperProfile).where(DeveloperProfile.user_id == user_id)
            ).first()

            if dev_profile is None:
                dev_profile = DeveloperProfile(
                    user_id=convert_uuid(user_id), storage_path=storage_path
                )
                self.session.add(dev_profile)
            elif storage_path is not None:
                dev_profile.storage_path = storage_path
                self.session.add(dev_profile)
                self.storage.create_dir(storage_path)

            self.session.commit()
            self.session.refresh(dev_profile)
            return dev_profile
        except Exception as e:
            raise ValueError(f"Failed setting up developer profile {e}")

    async def generate_storage_path(self, id: ID) -> str:
        user = await self.user_mng.get_user(id)
        if not user:
            raise ValueError(f"User {id} is None")
        institution = await self.user_mng.get_user_inst(id)
        institution_name = (
            institution.name.value
            if institution and hasattr(institution.name, "value")
            else (institution.name if institution else "untitled_institution")
        )
        institution_slug = (
            re.sub(r"[^a-z0-9_-]+", "_", institution_name.lower()).strip("_")
            or "untitled_institution"
        )
        storage_path = f"{institution_slug}/developers/{user.id}/"
        return storage_path


class DeveloperQuestionService:
    def __init__(self, developer_access: DeveloperAccessService, question_manager: QuestionManager):
        self.developer_access = developer_access
        self.question_manager = question_manager

    async def list_my_questions(self, user_id):
        await self.developer_access.require_developer_access(user_id)
        return self.question_manager.list_questions_by_creator(user_id)

    async def create_question(self, user_id, payload):
        await self.developer_access.require_developer_access(user_id)
        profile = await self.developer_access.set_developer_data(user_id)
        return await self.question_manager.create_question(
            payload,
            created_by=user_id,
            storage_path=profile.storage_path,
        )

# Backward-compatible alias while call sites migrate.
Developer = DeveloperAccessService
