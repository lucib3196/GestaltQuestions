from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, select

from backend.access_policy import (
    AccessLevel,
    ResourceAccessAdapter,
    ResourceAccessOperationError,
    ResourceAccessValidationError,
)
from backend.developer import DeveloperProfile
from backend.question import Question
from backend.question.schema import Status
from backend.question_access.model import QuestionAccess
from backend.shared import ID
from backend.utils import convert_uuid


class QuestionAccessAdapter(
    ResourceAccessAdapter[QuestionAccess, DeveloperProfile, Question]
):
    def __init__(self, session: Session, name: str = "Question") -> None:
        super().__init__(name)
        self._session = session

    async def get_resource(self, resource_id: ID) -> Question | None:
        try:
            return self._session.get(Question, convert_uuid(resource_id))
        except SQLAlchemyError as e:
            raise self._operation_error(
                "retrieve resource",
                resource_id=str(resource_id),
                details=str(e),
            ) from e

    async def get_access(
        self, resource: Question, profile: DeveloperProfile
    ) -> QuestionAccess | None:
        self._validate_resource(resource)

        try:
            stmt = select(QuestionAccess).where(
                QuestionAccess.question_id == resource.id,
                QuestionAccess.developer_id == profile.id,
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
        self, resource: Question, profile: DeveloperProfile, level: AccessLevel
    ) -> QuestionAccess:
        self._validate_resource(resource)

        try:
            qaccess = QuestionAccess(
                question_id=resource.id,  # type: ignore
                developer_id=profile.id,
                access_level=level,
            )
            self._session.add(qaccess)
            self._session.commit()
            self._session.refresh(qaccess)
            return qaccess
        except SQLAlchemyError as e:
            self._session.rollback()
            raise self._operation_error(
                "create access",
                resource_id=self._resource_id(resource),
                profile_id=str(profile.id),
                details=str(e),
            ) from e

    async def update_access(
        self, access: QuestionAccess, level: AccessLevel
    ) -> QuestionAccess:
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
                resource_id=str(access.question_id),
                profile_id=str(access.developer_id),
                details=str(e),
            ) from e

    async def remove_access(
        self, target: DeveloperProfile, resource: Question
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

    async def is_owner(self, resource: Question, profile: DeveloperProfile) -> bool:
        return resource.created_by_id == profile.id

    async def is_public(self, resource: Question) -> bool:
        return resource.status == Status.PUBLISHED

    def _validate_resource(self, resource: Question) -> None:
        if resource.id is None:
            raise ResourceAccessValidationError(
                "Question must be persisted before access can be managed",
                resource_name=self.name,
            )

    def _resource_id(self, resource: Question) -> str | None:
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
