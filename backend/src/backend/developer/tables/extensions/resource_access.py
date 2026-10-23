from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal, Protocol, TypeVar
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Mapped, aliased
from sqlalchemy.sql import Select
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.authorization import AccessLevel
from backend.tables import TableExtension


class AccessRecordProtocol(Protocol):
    id: UUID | None
    granted_by_id: UUID | None
    access_level: AccessLevel
    created_at: datetime
    updated_at: datetime


class ProfileProtocol(Protocol):
    id: UUID
    user_id: UUID


class UserProtocol(Protocol):
    id: UUID
    email: str


AccessT = TypeVar("AccessT", bound=AccessRecordProtocol)
ProfileT = TypeVar("ProfileT", bound=ProfileProtocol)
UserT = TypeVar("UserT", bound=UserProtocol)


@dataclass(frozen=True)
class AccessTableConfig[
    AccessT: AccessRecordProtocol,
    ProfileT: ProfileProtocol,
    UserT: UserProtocol,
]:
    access_model: type[AccessT]
    subject_model: type[ProfileT]
    user_model: type[UserT]

    resource_id_attr: str
    subject_id_attr: str
    subquery_resource_id_attr: str | None = None


class ResourceAccessTableExtension[
    AccessT: AccessRecordProtocol,
    ProfileT: ProfileProtocol,
    UserT: UserProtocol,
](TableExtension):
    def __init__(
        self,
        config: AccessTableConfig[AccessT, ProfileT, UserT],
        *,
        granted_by_id: UUID | None = None,
        granted_to_id: UUID | None = None,
        dialect_name: str = "postgresql",
        join_type: Literal["inner", "outer"] = "inner",
    ) -> None:
        self._config = config
        self._granted_by_id = granted_by_id
        self._granted_to_id = granted_to_id
        self._dialect_name = dialect_name
        self._join_type = join_type
        self.access = aliased(config.access_model, name="access")
        self.granted_by_subject = aliased(
            config.subject_model,
            name="granted_by_subject",
        )
        self.granted_by_user = aliased(config.user_model, name="granted_by_user")

        self.grantee_subject = aliased(config.subject_model, name="grantee_subject")
        self.grantee_user = aliased(config.user_model, name="grantee_user")

    def apply(self, stmt: Select, subquery: Subquery) -> Select:
        access_summary = self.access_summary_subquery()
        subquery_resource_id = getattr(
            subquery.c,
            self._config.subquery_resource_id_attr or self._config.resource_id_attr,
        )
        join = stmt.outerjoin if self._join_type == "outer" else stmt.join

        return join(
            access_summary,
            access_summary.c.resource_id == subquery_resource_id,
        ).add_columns(
            access_summary.c.member_ids,
            access_summary.c.granted_to_emails,
            access_summary.c.access_levels,
            access_summary.c.shared_at,
            access_summary.c.granted_by_email,
        )

    def access_summary_subquery(self) -> Subquery:
        resource_id = self.access_resource_id
        subject_id = self.access_subject_id

        stmt = (
            select(
                resource_id.label("resource_id"),
                self.aggregate_list(col(self.grantee_user.id), "member_ids"),
                self.aggregate_list(col(self.grantee_user.email), "granted_to_emails"),
                self.aggregate_list(col(self.access.access_level), "access_levels"),
                func.min(self.access.created_at).label("shared_at"),
                func.min(self.granted_by_user.email).label("granted_by_email"),
            )
            .select_from(self.access)
            .outerjoin(
                self.granted_by_subject,
                col(self.granted_by_subject.id) == col(self.access.granted_by_id),
            )
            .outerjoin(
                self.granted_by_user,
                col(self.granted_by_user.id) == col(self.granted_by_subject.user_id),
            )
            .outerjoin(self.grantee_subject, col(self.grantee_subject.id) == subject_id)
            .outerjoin(
                self.grantee_user,
                col(self.grantee_user.id) == self.grantee_subject.user_id,
            )
            .where(col(self.access.access_level) != AccessLevel.OWNER)
        )
        stmt = self.apply_access_filters(stmt)
        return stmt.group_by(
            col(resource_id),
            col(self.access.access_level),
        ).subquery("access_summary")

    def apply_access_filters(self, stmt: Select) -> Select:
        if self._granted_by_id is not None:
            stmt = stmt.where(col(self.access.granted_by_id) == self._granted_by_id)

        if self._granted_to_id is not None:
            stmt = stmt.where(self.access_subject_id == self._granted_to_id)

        return stmt

    @property
    def access_resource_id(self) -> Any:
        return getattr(self.access, self._config.resource_id_attr)

    @property
    def access_subject_id(self) -> Any:
        return getattr(self.access, self._config.subject_id_attr)

    def aggregate_list(
        self,
        value: ColumnElement[Any] | Mapped[Any],
        label: str,
    ) -> ColumnElement[Any]:
        if self._dialect_name == "sqlite":
            return func.json_group_array(value).label(label)
        return func.array_agg(value).label(label)
