from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, ForeignKey, Index, UniqueConstraint, text
from sqlmodel import Field, SQLModel

from backend.authorization import AccessLevel


class QuestionAccess(SQLModel, table=True):
    __tablename__ = "question_access"  # type: ignore
    __table_args__ = (
        UniqueConstraint(
            "question_id",
            "developer_id",
            name="uq_question_access_question_developer",
        ),
        Index(
            "uq_question_access_one_owner_per_question",
            "question_id",
            unique=True,
            sqlite_where=text("access_level = 'OWNER'"),
            postgresql_where="access_level = 'OWNER'",
        ),
    )
    id: UUID | None = Field(default_factory=uuid4, primary_key=True, index=True)
    # Maps the question id and the developer who has access
    question_id: UUID = Field(
        sa_column=Column(
            ForeignKey("question.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
    )
    # Defines who granted the access
    granted_by_id: UUID | None = Field(
        default=None,
        foreign_key="developer_profile.id",
    )
    # Defines the person who has the access
    developer_id: UUID = Field(foreign_key="developer_profile.id")
    # Defines the access level
    access_level: AccessLevel

    # General timekeeping
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
