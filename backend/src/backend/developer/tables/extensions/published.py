from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery

from backend.question import Status
from backend.tables import TableExtension


class PublishedQuestionTableExtension(TableExtension):
    """Filters the question table to published questions."""

    def apply(self, stmt: Select, question_table: Subquery) -> Select:
        """Add a published status filter to the statement."""
        return stmt.where(question_table.c.status == Status.PUBLISHED.name)
