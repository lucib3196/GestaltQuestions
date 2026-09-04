from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.authorization import AccessLevel
from backend.question.access import QuestionAccess
from backend.tables import TableExtension


class SharedByMeQuestionTableExtension(TableExtension):
    """Adds access metadata for questions shared by one developer."""

    def __init__(self, developer_profile_id: UUID) -> None:
        """Store the developer profile id used to filter granted shares."""
        self._developer_profile_id = developer_profile_id

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Join question access rows granted by the current developer."""

        return stmt.where(
            col(QuestionAccess.granted_by_id) == self._developer_profile_id,
            col(QuestionAccess.access_level) != AccessLevel.OWNER,
        )
