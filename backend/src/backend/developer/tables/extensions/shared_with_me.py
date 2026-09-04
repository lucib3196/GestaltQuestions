from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.authorization import AccessLevel
from backend.question.access import QuestionAccess
from backend.question.views.services import QuestionTableExtension


class SharedWithMeQuestionTableExtension(QuestionTableExtension):
    """Adds access metadata for questions shared with one developer."""

    def __init__(self, developer_profile_id: UUID) -> None:
        """Store the developer profile id used to filter shared questions."""
        self._developer_profile_id = developer_profile_id

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Join question access rows shared with the current developer."""
        return stmt.where(
            col(QuestionAccess.developer_id) == self._developer_profile_id,
            col(QuestionAccess.access_level) != AccessLevel.OWNER,
        )
