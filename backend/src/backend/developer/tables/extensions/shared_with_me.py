from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery

from backend.accounts.model import User
from backend.authorization import AccessLevel
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess
from backend.question.views.services import QuestionTableExtension


class SharedWithMeQuestionTableExtension(QuestionTableExtension):
    """Adds access metadata for questions shared with one developer."""

    def __init__(self, developer_profile_id: UUID) -> None:
        """Store the developer profile id used to filter shared questions."""
        self._developer_profile_id = developer_profile_id

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Join question access rows shared with the current developer."""
        return (
            stmt.add_columns(
                QuestionAccess.access_level.label("access_level"),  # type: ignore
                QuestionAccess.granted_by_id.label("granted_by_id"),  # type: ignore
                QuestionAccess.created_at.label(  # pyright: ignore[reportAttributeAccessIssue]
                    "shared_at"
                ),  # pyright: ignore[reportAttributeAccessIssue]
                User.email.label(  # pyright: ignore[reportAttributeAccessIssue]
                    "granted_by_email"
                ),
            )
            .join(
                QuestionAccess,
                QuestionAccess.question_id == question_table.c.question_id,  # pyright: ignore[reportArgumentType]
            )
            .outerjoin(
                DeveloperProfile,
                DeveloperProfile.id == QuestionAccess.granted_by_id,  # pyright: ignore[reportArgumentType]
            )
            .outerjoin(
                User,
                User.id == DeveloperProfile.user_id,  # pyright: ignore[reportArgumentType]
            )
            .where(
                QuestionAccess.developer_id == self._developer_profile_id,  # pyright: ignore[reportArgumentType]
                QuestionAccess.access_level != AccessLevel.OWNER,  # pyright: ignore[reportArgumentType]
            )
        )
