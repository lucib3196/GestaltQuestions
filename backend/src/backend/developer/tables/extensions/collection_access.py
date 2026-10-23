from uuid import UUID

from backend.accounts.model import User
from backend.developer import DeveloperProfile
from backend.question.collections.models import QuestionCollectionAccess

from .resource_access import AccessTableConfig, ResourceAccessTableExtension

collection_access_config = AccessTableConfig(
    access_model=QuestionCollectionAccess,
    subject_model=DeveloperProfile,
    user_model=User,
    resource_id_attr="collection_id",
    subject_id_attr="developer_id",
    subquery_resource_id_attr="id",
)


class CollectionAccessTableExtension(
    ResourceAccessTableExtension[QuestionCollectionAccess, DeveloperProfile, User]
):
    """Adds shared access metadata to collection table queries."""

    def __init__(
        self,
        *,
        granted_by_id: UUID | None = None,
        granted_to_id: UUID | None = None,
        dialect_name: str = "postgresql",
    ) -> None:
        super().__init__(
            collection_access_config,
            granted_by_id=granted_by_id,
            granted_to_id=granted_to_id,
            dialect_name=dialect_name,
        )
