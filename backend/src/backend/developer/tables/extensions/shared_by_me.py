from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlalchemy.orm import aliased
from backend.accounts.model import User
from backend.authorization import AccessLevel
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess
from backend.question.views.services import QuestionTableExtension

from sqlalchemy import func
from sqlalchemy.orm import aliased


class SharedByMeQuestionTableExtension(QuestionTableExtension):
    """Adds access metadata for questions shared by one developer."""

    def __init__(self, developer_profile_id: UUID) -> None:
        """Store the developer profile id used to filter granted shares."""
        self._developer_profile_id = developer_profile_id

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Join question access rows granted by the current developer."""
        granted_by_profile = aliased(DeveloperProfile, name="granted_by_profile")
        granted_by_user = aliased(User, name="granted_by_user")

        grantee_profile = aliased(DeveloperProfile, name="grantee_profile")
        grantee_user = aliased(User, name="grantee_user")

        return (
            stmt.add_columns(
                QuestionAccess.access_level.label("access_level"),
                QuestionAccess.granted_by_id.label("granted_by_id"),
                QuestionAccess.developer_id.label("granted_to_id"),
                QuestionAccess.created_at.label("shared_at"),
                granted_by_user.email.label("granted_by_email"),
                grantee_user.email.label("granted_to_email"),
            )
            .join(
                QuestionAccess,
                QuestionAccess.question_id == question_table.c.question_id,
            )
            .outerjoin(
                granted_by_profile,
                granted_by_profile.id == QuestionAccess.granted_by_id,
            )
            .outerjoin(
                granted_by_user,
                granted_by_user.id == granted_by_profile.user_id,
            )
            .outerjoin(
                grantee_profile,
                grantee_profile.id == QuestionAccess.developer_id,
            )
            .outerjoin(
                grantee_user,
                grantee_user.id == grantee_profile.user_id,
            )
            .where(
                QuestionAccess.granted_by_id == self._developer_profile_id,
                QuestionAccess.access_level != AccessLevel.OWNER,
            )
        )
