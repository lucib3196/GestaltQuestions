from uuid import UUID

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery

from backend.tables import TableExtension


class DeveloperQuestionTableExtension(TableExtension):
    """Filters the question table to questions created by one developer."""

    def __init__(self, developer_profile_id: UUID) -> None:
        """Store the developer profile id used to filter owned questions."""
        self._developer_profile_id = developer_profile_id

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Add a developer-owned question filter to the statement."""
        return stmt.where(question_table.c.created_by_id == self._developer_profile_id)
