"""Add collection bookmarks.

Revision ID: 9a12d8b61f3e
Revises: e59dc78510a4
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "9a12d8b61f3e"
down_revision: str | Sequence[str] | None = "e59dc78510a4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "question_collection_bookmark",
        sa.Column("developer_id", sa.Uuid(), nullable=False),
        sa.Column("collection_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_id"], ["question_collection.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["developer_id"], ["developer_profile.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("developer_id", "collection_id"),
    )


def downgrade() -> None:
    op.drop_table("question_collection_bookmark")
