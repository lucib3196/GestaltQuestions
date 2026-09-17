from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Mapped, aliased
from sqlalchemy.sql import Select
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.accounts.model import User
from backend.authorization import AccessLevel
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess
from backend.tables import TableExtension

granted_by_profile = aliased(DeveloperProfile, name="granted_by_profile")
granted_by_user = aliased(User, name="granted_by_user")

grantee_profile = aliased(DeveloperProfile, name="grantee_profile")
grantee_user = aliased(User, name="grantee_user")


class QuestionAccessTableExtension(TableExtension):
    """Addss access metadata for question shared by joining the question access table"""

    def __init__(
        self,
        *,
        granted_by_id: UUID | None = None,
        granted_to_id: UUID | None = None,
        dialect_name: str = "postgresql",
    ) -> None:
        self._granted_by_id = granted_by_id
        self._granted_to_id = granted_to_id
        self._dialect_name = dialect_name

    def apply(self, stmt: Select, subquery: Subquery) -> Select:
        access_summary = self.access_summary_join(stmt, subquery)
        return stmt.join(
            access_summary,
            access_summary.c.question_id == subquery.c.question_id,
        ).add_columns(
            access_summary.c.member_ids,
            access_summary.c.granted_to_emails,
            access_summary.c.access_levels,
            access_summary.c.shared_at,
            access_summary.c.granted_by_email,
        )

    def access_summary_join(self, stmt: Select, subquery: Subquery) -> Subquery:
        """Generates a subquery where we join based on the access and grouping based of question id"""

        sub = (
            select(
                col(QuestionAccess.question_id).label("question_id"),
                self.aggregate_list(col(grantee_user.id), "member_ids"),
                self.aggregate_list(col(grantee_user.email), "granted_to_emails"),
                self.aggregate_list(col(QuestionAccess.access_level), "access_levels"),
                func.min(col(QuestionAccess.created_at)).label("shared_at"),
                func.min(col(granted_by_user.email)).label("granted_by_email"),
            )
            .select_from(QuestionAccess)
            .outerjoin(
                granted_by_profile,
                col(granted_by_profile.id) == col(QuestionAccess.granted_by_id),
            )
            .outerjoin(
                granted_by_user,
                col(granted_by_user.id) == col(granted_by_profile.user_id),
            )
            .outerjoin(
                grantee_profile,
                col(grantee_profile.id) == col(QuestionAccess.developer_id),
            )
            .outerjoin(
                grantee_user,
                col(grantee_user.id) == col(grantee_profile.user_id),
            )
            .where(col(QuestionAccess.access_level) != AccessLevel.OWNER)
        )
        if self._granted_by_id is not None:
            sub = sub.where(col(QuestionAccess.granted_by_id) == self._granted_by_id)

        if self._granted_to_id is not None:
            sub = sub.where(col(QuestionAccess.developer_id) == self._granted_to_id)

        return sub.group_by(
            col(QuestionAccess.question_id), col(QuestionAccess.access_level)
        ).subquery("access_summary")

    def aggregate_list(self, value: ColumnElement[Any] | Mapped[Any], label: str):
        if self._dialect_name == "sqlite":
            return func.json_group_array(value).label(label)
        return func.array_agg(value).label(label)
