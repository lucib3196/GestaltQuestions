"""Add user bookmarks for published questions.

Revision ID: b731de82a4c9
Revises: ab41d56e3c20
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b731de82a4c9"
down_revision: str | Sequence[str] | None = "ab41d56e3c20"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "question_bookmark",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("question_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["question.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "question_id"),
    )


def downgrade() -> None:
    op.drop_table("question_bookmark")
