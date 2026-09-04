from sqlalchemy.orm import aliased
from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col
from sqlalchemy import func
from sqlalchemy import select
from backend.accounts.model import User
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess
from backend.tables import TableExtension
from uuid import UUID
from backend.authorization import AccessLevel

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
    ) -> None:
        self._granted_by_id = granted_by_id
        self._granted_to_id = granted_to_id

    def apply(self, stmt: Select, subquery: Subquery) -> Select:
        access_summary = self.access_summary_join(stmt, subquery)
        stmt = stmt.join(
            access_summary,
            access_summary.c.question_id == subquery.c.question_id,
        ).add_columns(
            access_summary.c.member_ids,
            access_summary.c.granted_to_emails,
            access_summary.c.access_levels,
            access_summary.c.shared_at,
            access_summary.c.granted_by_email,
        )

        return stmt

    def access_summary_join(self, stmt: Select, subquery: Subquery) -> Subquery:
        """Generates a subquery where we join based on the access and grouping based of question id"""

        sub = (
            select(
                col(QuestionAccess.question_id).label("question_id"),
                func.array_agg(col(grantee_user.id)).label("member_ids"),
                func.array_agg(col(grantee_user.email)).label("granted_to_emails"),
                func.array_agg(col(QuestionAccess.access_level)).label("access_levels"),
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
            sub.where(col(QuestionAccess.granted_by_id) == self._granted_by_id)

        if self._granted_to_id is not None:
            sub.where(col(QuestionAccess.developer_id) == self._granted_to_id)

        return sub.group_by(
            col(QuestionAccess.question_id), col(QuestionAccess.access_level)
        ).subquery("access_summary")
