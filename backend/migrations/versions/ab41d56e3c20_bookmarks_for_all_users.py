"""Associate collection bookmarks with users instead of developer profiles.

Revision ID: ab41d56e3c20
Revises: 9a12d8b61f3e
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "ab41d56e3c20"
down_revision: str | Sequence[str] | None = "9a12d8b61f3e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "question_collection_bookmark",
        sa.Column("user_id", sa.Uuid(), nullable=True),
    )
    op.execute("""
        UPDATE question_collection_bookmark AS bookmark
        SET user_id = developer_profile.user_id
        FROM developer_profile
        WHERE bookmark.developer_id = developer_profile.id
    """)
    op.drop_constraint(
        "question_collection_bookmark_pkey",
        "question_collection_bookmark",
        type_="primary",
    )
    op.drop_constraint(
        "question_collection_bookmark_developer_id_fkey",
        "question_collection_bookmark",
        type_="foreignkey",
    )
    op.drop_column("question_collection_bookmark", "developer_id")
    op.alter_column(
        "question_collection_bookmark",
        "user_id",
        existing_type=sa.Uuid(),
        nullable=False,
    )
    op.create_foreign_key(
        "question_collection_bookmark_user_id_fkey",
        "question_collection_bookmark",
        "user",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_primary_key(
        "question_collection_bookmark_pkey",
        "question_collection_bookmark",
        ["user_id", "collection_id"],
    )


def downgrade() -> None:
    op.execute("""
        DELETE FROM question_collection_bookmark AS bookmark
        WHERE NOT EXISTS (
            SELECT 1
            FROM developer_profile
            WHERE developer_profile.user_id = bookmark.user_id
        )
    """)
    op.add_column(
        "question_collection_bookmark",
        sa.Column("developer_id", sa.Uuid(), nullable=True),
    )
    op.execute("""
        UPDATE question_collection_bookmark AS bookmark
        SET developer_id = developer_profile.id
        FROM developer_profile
        WHERE bookmark.user_id = developer_profile.user_id
    """)
    op.drop_constraint(
        "question_collection_bookmark_pkey",
        "question_collection_bookmark",
        type_="primary",
    )
    op.drop_constraint(
        "question_collection_bookmark_user_id_fkey",
        "question_collection_bookmark",
        type_="foreignkey",
    )
    op.drop_column("question_collection_bookmark", "user_id")
    op.alter_column(
        "question_collection_bookmark",
        "developer_id",
        existing_type=sa.Uuid(),
        nullable=False,
    )
    op.create_foreign_key(
        "question_collection_bookmark_developer_id_fkey",
        "question_collection_bookmark",
        "developer_profile",
        ["developer_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_primary_key(
        "question_collection_bookmark_pkey",
        "question_collection_bookmark",
        ["developer_id", "collection_id"],
    )
