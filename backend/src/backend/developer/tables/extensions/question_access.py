from sqlalchemy.orm import aliased
from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.accounts.model import User
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess
from backend.tables import TableExtension


class QuestionAccessTableExtension(TableExtension):
    """Addss access metadata for question shared by joining the question access table"""

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        granted_by_profile = aliased(DeveloperProfile, name="granted_by_profile")
        granted_by_user = aliased(User, name="granted_by_user")

        grantee_profile = aliased(DeveloperProfile, name="grantee_profile")
        grantee_user = aliased(User, name="grantee_user")
        stmt = (
            stmt.add_columns(
                col(QuestionAccess.access_level).label("access_level"),
                col(QuestionAccess.granted_by_id).label("granted_by_id"),
                col(QuestionAccess.developer_id).label("granted_to_id"),
                col(QuestionAccess.created_at).label("shared_at"),
                col(granted_by_user.email).label("granted_by_email"),
                col(grantee_user.email).label("granted_to_email"),
            )
            .join(
                QuestionAccess,
                col(QuestionAccess.question_id) == question_table.c.question_id,
            )
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
        )
        return stmt
