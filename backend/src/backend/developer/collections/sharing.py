from collections.abc import Sequence

from pydantic import BaseModel

from backend.authorization.resources import ResourceSharingService
from backend.authorization.types import AccessLevel
from backend.developer.collections.access import (
    DetailRead,
    QuestionCollectionAccessService,
)
from backend.developer.model import DeveloperProfile
from backend.question.collections import QuestionCollectionAccess
from backend.question.collections.models import QuestionCollection
from backend.shared import ID


class ShareCollectionFailure(BaseModel):
    collection_id: ID
    target_user_id: ID
    reason: str


class ShareCollectionBatchResult(BaseModel):
    shared: list[QuestionCollectionAccess]
    failed: list[ShareCollectionFailure]


class CollectionSharing(
    ResourceSharingService[
        QuestionCollectionAccess,
        DeveloperProfile,
        QuestionCollection,
    ]
):
    def __init__(
        self,
        access_service: QuestionCollectionAccessService,
    ) -> None:
        super().__init__(access_service=access_service)

    async def list_shared_by_me(self, user_id: ID) -> Sequence[DetailRead]:
        return await self._access_service.list_access_shared_by(user_id)

    async def share_collections_with_users(
        self,
        owner: ID | DeveloperProfile,
        collection_ids: list[ID],
        target_user_ids: list[ID],
        level: AccessLevel,
    ) -> ShareCollectionBatchResult:
        result = await self.batch_share_resources(
            owner=owner,
            targets=target_user_ids,
            resources=collection_ids,
            level=level,
        )

        return ShareCollectionBatchResult(
            shared=result.shared,
            failed=[
                ShareCollectionFailure(
                    collection_id=failure.resource_id,
                    target_user_id=failure.target_user_id,
                    reason=failure.reason,
                )
                for failure in result.failed
            ],
        )
