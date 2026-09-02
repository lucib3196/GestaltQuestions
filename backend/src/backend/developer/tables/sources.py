from dataclasses import dataclass
from uuid import UUID

from backend.question.views.services.table_sources import TableQuerySource

TABLE_VIEW_ALIAS = "table_view"
QUESTION_ACCESS_ALIAS = "access"
GRANTED_BY_PROFILE_ALIAS = "granted_by"
GRANTED_BY_USER_ALIAS = "granted_by_user"


def sql_parts(*parts: str) -> str:
    return " ".join(part.strip() for part in parts if part.strip())


def select_columns(*columns: str) -> str:
    return ", ".join(column.strip() for column in columns if column.strip())


def join_clause(kind: str, table: str, alias: str, on: str) -> str:
    return sql_parts(kind, "JOIN", table, alias, "ON", on)


def inner_join(table: str, alias: str, on: str) -> str:
    return join_clause("INNER", table, alias, on)


def left_join(table: str, alias: str, on: str) -> str:
    return join_clause("LEFT", table, alias, on)


def base_question_table_from(view_name: str) -> str:
    return sql_parts(view_name, TABLE_VIEW_ALIAS)


def shared_question_table_from(view_name: str) -> str:
    return sql_parts(
        base_question_table_from(view_name),
        inner_join(
            "question_access",
            QUESTION_ACCESS_ALIAS,
            f"{QUESTION_ACCESS_ALIAS}.question_id = {TABLE_VIEW_ALIAS}.question_id",
        ),
        left_join(
            "developer_profile",
            GRANTED_BY_PROFILE_ALIAS,
            f"{QUESTION_ACCESS_ALIAS}.granted_by_id = {GRANTED_BY_PROFILE_ALIAS}.id",
        ),
        left_join(
            '"user"',
            GRANTED_BY_USER_ALIAS,
            f"{GRANTED_BY_PROFILE_ALIAS}.user_id = {GRANTED_BY_USER_ALIAS}.id",
        ),
    )


SHARED_QUESTION_SELECT_SQL = select_columns(
    f"{TABLE_VIEW_ALIAS}.*",
    f"{QUESTION_ACCESS_ALIAS}.access_level",
    f"{QUESTION_ACCESS_ALIAS}.granted_by_id",
    f"{QUESTION_ACCESS_ALIAS}.created_at AS shared_at",
    f"{GRANTED_BY_USER_ALIAS}.email AS granted_by_email",
)


@dataclass(frozen=True)
class DeveloperQuestionTableSource:
    developer_profile_id: UUID

    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(
            from_sql=base_question_table_from(view_name),
            where_clauses=(
                f"{TABLE_VIEW_ALIAS}.developer_profile_id = :developer_profile_id",
            ),
            params={"developer_profile_id": self.developer_profile_id},
        )


@dataclass(frozen=True)
class SharedWithMeQuestionTableSource:
    developer_profile_id: UUID

    def build(self, view_name: str) -> TableQuerySource:
        return TableQuerySource(
            from_sql=shared_question_table_from(view_name),
            select_sql=SHARED_QUESTION_SELECT_SQL,
            where_clauses=(
                f"{QUESTION_ACCESS_ALIAS}.developer_id = :shared_with_profile_id",
                f"{QUESTION_ACCESS_ALIAS}.access_level != :owner_access_level",
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
            from_sql=shared_question_table_from(view_name),
            select_sql=SHARED_QUESTION_SELECT_SQL,
            where_clauses=(
                f"{QUESTION_ACCESS_ALIAS}.granted_by_id = :shared_by_profile_id",
                f"{QUESTION_ACCESS_ALIAS}.access_level != :owner_access_level",
            ),
            params={
                "shared_by_profile_id": self.developer_profile_id,
                "owner_access_level": "OWNER",
            },
        )
