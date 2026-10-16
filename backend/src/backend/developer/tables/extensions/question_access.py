from uuid import UUID

from backend.accounts.model import User
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess

from .resource_access import AccessTableConfig, ResourceAccessTableExtension

question_access_config = AccessTableConfig(
    access_model=QuestionAccess,
    subject_model=DeveloperProfile,
    user_model=User,
    resource_id_attr="question_id",
    subject_id_attr="developer_id",
)


class QuestionAccessTableExtension(
    ResourceAccessTableExtension[QuestionAccess, DeveloperProfile, User]
):
    """Adds shared access metadata to question table queries."""

    def __init__(
        self,
        *,
        granted_by_id: UUID | None = None,
        granted_to_id: UUID | None = None,
        dialect_name: str = "postgresql",
    ) -> None:
        super().__init__(
            question_access_config,
            granted_by_id=granted_by_id,
            granted_to_id=granted_to_id,
            dialect_name=dialect_name,
        )
