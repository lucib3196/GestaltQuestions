from dataclasses import dataclass
from uuid import UUID

from backend.question.views.services.table_sources import TableQuerySource

TABLE_VIEW_ALIAS = "table_view"

SHARED_QUESTION_SELECT_SQL = """
    table_view.*,
    access.access_level,
    access.granted_by_id,
    access.created_at AS shared_at,
    granted_by_user.email AS granted_by_email
"""

SHARED_QUESTION_FROM_SQL = """
    {view_name} table_view
    INNER JOIN question_access access
        ON access.question_id = table_view.question_id
    LEFT JOIN developer_profile granted_by
        ON access.granted_by_id = granted_by.id
    LEFT JOIN "user" granted_by_user
        ON granted_by.user_id = granted_by_user.id
"""


@dataclass(frozen=True)
class DeveloperQuestionTableSource:
    developer_profile_id: UUID

    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(
            from_sql=f"{view_name} {TABLE_VIEW_ALIAS}",
            where_clauses=("table_view.developer_profile_id = :developer_profile_id",),
            params={"developer_profile_id": self.developer_profile_id},
        )


@dataclass(frozen=True)
class SharedWithMeQuestionTableSource:
    developer_profile_id: UUID

    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(
            from_sql=SHARED_QUESTION_FROM_SQL.format(view_name=view_name),
            select_sql=SHARED_QUESTION_SELECT_SQL,
            where_clauses=(
                "access.developer_id = :shared_with_profile_id",
                "access.access_level != :owner_access_level",
            ),
            params={
                "shared_with_profile_id": self.developer_profile_id,
                "owner_access_level": "OWNER",
            },
        )


@dataclass(frozen=True)
class SharedByMeQuestionTableSource:
    developer_profile_id: UUID

    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(
            from_sql=SHARED_QUESTION_FROM_SQL.format(view_name=view_name),
            select_sql=SHARED_QUESTION_SELECT_SQL,
            where_clauses=(
                "access.granted_by_id = :shared_by_profile_id",
                "access.access_level != :owner_access_level",
            ),
            params={
                "shared_by_profile_id": self.developer_profile_id,
                "owner_access_level": "OWNER",
            },
        )
