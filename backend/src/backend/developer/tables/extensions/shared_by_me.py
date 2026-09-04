from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery

from backend.accounts.model import User
from backend.authorization import AccessLevel
from backend.developer import DeveloperProfile
from backend.question.access import QuestionAccess
from backend.question.views.services import QuestionTableExtension


class SharedByMeQuestionTableExtension(QuestionTableExtension):
    """Adds access metadata for questions shared by one developer."""

    def __init__(self, developer_profile_id: UUID) -> None:
        """Store the developer profile id used to filter granted shares."""
        self._developer_profile_id = developer_profile_id

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Join question access rows granted by the current developer."""
        return (
            stmt.add_columns(
                QuestionAccess.access_level.label(  # pyright: ignore[reportAttributeAccessIssue]
                    "access_level"
                ),  # pyright: ignore[reportAttributeAccessIssue]
                QuestionAccess.granted_by_id.label("granted_by_id"),  # type: ignore
                User.email.label("granted_by_email"),  # type: ignore
            )
            .join(
                QuestionAccess,
                QuestionAccess.question_id == question_table.c.question_id,  # pyright: ignore[reportArgumentType]
            )
            .outerjoin(
                DeveloperProfile,
                DeveloperProfile.id == QuestionAccess.granted_by_id,  # pyright: ignore[reportArgumentType]
            )
            .outerjoin(User, User.id == DeveloperProfile.user_id)  # type: ignore
            .where(
                QuestionAccess.granted_by_id == self._developer_profile_id,  # pyright: ignore[reportArgumentType]
                QuestionAccess.access_level != AccessLevel.OWNER,  # pyright: ignore[reportArgumentType]
            )
        )
