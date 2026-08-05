from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import (
    AccessLevel,
    ResourceAccessAdapter,
    ResourceAccessOperationError,
    ResourceAccessValidationError,
)
from backend.developer.model import DeveloperProfile
from backend.question_collections.model import (
    QuestionCollection,
    QuestionCollectionAccess,
)
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionCollectionAdapter(
    ResourceAccessAdapter[
        QuestionCollectionAccess, DeveloperProfile, QuestionCollection
    ]
):
    def __init__(self, session: Session) -> None:
        super().__init__("Collection")
        self._session = session

    async def get_resource(self, resource_id: ID) -> QuestionCollection | None:
        try:
            return self._session.get(QuestionCollection, convert_uuid(resource_id))
        except SQLAlchemyError as e:
            raise self._operation_error(
                "retrieve resource",
                resource_id=str(resource_id),
                details=str(e),
            ) from e

    async def get_access(
        self,
        resource: QuestionCollection,
        profile: DeveloperProfile,
    ) -> QuestionCollectionAccess | None:
        self._validate_resource(resource)

        try:
            stmt = select(QuestionCollectionAccess).where(
                QuestionCollectionAccess.collection_id == resource.id,
                QuestionCollectionAccess.developer_id == profile.id,
            )
            return self._session.exec(stmt).first()
        except SQLAlchemyError as e:
            raise self._operation_error(
                "retrieve access",
                resource_id=self._resource_id(resource),
                profile_id=str(profile.id),
                details=str(e),
            ) from e

    async def build_access(
        self,
        resource: QuestionCollection,
        profile: DeveloperProfile,
        level: AccessLevel,
    ) -> QuestionCollectionAccess:
        self._validate_resource(resource)

        try:
            access = QuestionCollectionAccess(
                collection_id=resource.id,  # type: ignore[arg-type]
                developer_id=profile.id,
                access_level=level,
            )
            self._session.add(access)
            self._session.commit()
            self._session.refresh(access)
            return access
        except SQLAlchemyError as e:
            self._session.rollback()
            raise self._operation_error(
                "create access",
                resource_id=self._resource_id(resource),
                profile_id=str(profile.id),
                details=str(e),
            ) from e

    async def update_access(
        self,
        access: QuestionCollectionAccess,
        level: AccessLevel,
    ) -> QuestionCollectionAccess:
        try:
            access.access_level = level
            access.updated_at = datetime.now()
            self._session.add(access)
            self._session.commit()
            self._session.refresh(access)
            return access
        except SQLAlchemyError as e:
            self._session.rollback()
            raise self._operation_error(
                "update access",
                resource_id=str(access.collection_id),
                profile_id=str(access.developer_id),
                details=str(e),
            ) from e

    async def remove_access(
        self,
        target: DeveloperProfile,
        resource: QuestionCollection,
    ) -> None:
        self._validate_resource(resource)

        try:
            existing = await self.get_access(resource, target)
            if existing is None:
                raise ResourceAccessValidationError(
                    "Access does not exist",
                    resource_name=self.name,
                    resource_id=self._resource_id(resource),
                    profile_id=str(target.id),
                )

            self._session.delete(existing)
            self._session.commit()
        except ResourceAccessValidationError:
            raise
        except SQLAlchemyError as e:
            self._session.rollback()
            raise self._operation_error(
                "remove access",
                resource_id=self._resource_id(resource),
                profile_id=str(target.id),
                details=str(e),
            ) from e

    async def is_owner(
        self,
        resource: QuestionCollection,
        profile: DeveloperProfile,
    ) -> bool:
        return resource.owner_id == profile.id

    def _validate_resource(self, resource: QuestionCollection) -> None:
        if resource.id is None:
            raise ResourceAccessValidationError(
                "Collection must be persisted before access can be managed",
                resource_name=self.name,
            )

    def _resource_id(self, resource: QuestionCollection) -> str | None:
        if resource.id is None:
            return None
        return str(resource.id)

    def _operation_error(
        self,
        action: str,
        resource_id: str | None = None,
        profile_id: str | None = None,
        details: str = "",
    ) -> ResourceAccessOperationError:
        return ResourceAccessOperationError(
            action,
            resource_name=self.name,
            resource_id=resource_id,
            profile_id=profile_id,
            details=details,
        )
