import sqlalchemy.sql
from sqlalchemy.sql.selectable import Subquery

from sqlalchemy.sql import Select
from sqlalchemy.sql.selectable import Subquery
from sqlmodel import col

from backend.tables import TableExtension

from backend.question import Status
from backend.tables import TableExtension
from backend.accounts.model import User
from backend.developer.model import DeveloperProfile
from backend.accounts.model import Institution


class PublishedQuestionTableExtension(TableExtension):
    """Filters the question table to published questions."""

    def apply(self, stmt: Select, subquery: Subquery) -> Select:
        """Add a published status filter to the statement."""
        return stmt.where(subquery.c.status == Status.PUBLISHED.name)


class CreatedByTableExtension(TableExtension):
    def apply(self, stmt: Select, subquery: Subquery) -> Select:

        return (
            stmt.join(
                DeveloperProfile,
                subquery.c.created_by_id == DeveloperProfile.id,
            )
            .join(User, col(DeveloperProfile.user_id) == User.id)
            .join(Institution, col(User.institution_id) == Institution.id)
            .add_columns(col(User.email).label("created_by_email"))
            .add_columns(col(User.id).label("user_id"))
            .add_columns(col(Institution.name).label("institution"))
        )
