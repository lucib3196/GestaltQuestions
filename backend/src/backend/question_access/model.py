from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4
from sqlalchemy import UniqueConstraint, Index, text
from sqlmodel import Field, SQLModel


class AccessLevel(StrEnum):
    VIEW = "view"
    EDIT = "edit"
    FULL = "full"
    OWNER = "owner"


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
    question_id: UUID = Field(foreign_key="question.id")
    developer_id: UUID = Field(foreign_key="developer_profile.id")
    # Defines the access level
    access_level: AccessLevel

    # General timekeeping
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
