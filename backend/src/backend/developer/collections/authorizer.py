from backend.authorization.resources import ResourceAuthorizer
from backend.developer.exceptions import DeveloperAccessDenied
from backend.developer.model import DeveloperProfile
from backend.developer.profiles import DeveloperProfileService
from backend.question.collections import QuestionCollection, QuestionCollectionAccess

from .access import QuestionCollectionAccessService
from .actions import DeveloperCollectionAction, DeveloperCollectionPolicy


class DeveloperCollectionAuthorizer(
    ResourceAuthorizer[
        QuestionCollectionAccess,
        DeveloperProfile,
        QuestionCollection,
        DeveloperCollectionAction,
    ]
):
    def __init__(
        self,
        collection_access: QuestionCollectionAccessService,
        profile: DeveloperProfileService,
        policy: DeveloperCollectionPolicy | None = None,
    ) -> None:
        super().__init__(
            access=collection_access,
            profile=profile,
            policy=policy or DeveloperCollectionPolicy(),
            denied_error=lambda reason, user_id, resource_id: DeveloperAccessDenied(
                reason=reason,
                user_id=user_id,
                resource_id=resource_id,
            ),
        )
