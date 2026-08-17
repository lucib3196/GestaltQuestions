from datetime import UTC, datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, ForeignKey, Index, UniqueConstraint, text
from sqlmodel import Field, Relationship, SQLModel

from backend.access_policy import AccessLevel


class QuestionCollection(SQLModel, table=True):
    __tablename__ = "question_collection"  # type: ignore
    id: UUID | None = Field(default_factory=uuid4, primary_key=True, index=True)
    owner_id: UUID | None = Field(
        default=None,
        foreign_key="developer_profile.id",
    )
    title: str = Field(index=True)

    parent_id: UUID | None = Field(
        default=None,
        foreign_key="question_collection.id",
        index=True,
    )
    parent: Optional["QuestionCollection"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "QuestionCollection.id"},
    )
    children: list["QuestionCollection"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"cascade": "all, delete"},
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class QuestionCollectionLink(SQLModel, table=True):
    __tablename__ = "question_collection_link"  # type: ignore

    question_id: UUID | None = Field(
        sa_column=Column(
            ForeignKey("question.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
    )
    collection_id: UUID = Field(
        sa_column=Column(
            ForeignKey("question_collection.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True,
        ),
    )


class QuestionCollectionAccess(SQLModel, table=True):
    __tablename__ = "question_collection_access"  # type: ignore

    __table_args__ = (
        UniqueConstraint(
            "collection_id",
            "developer_id",
            name="uq_question_collection_access_collection_developer",
        ),
        Index(
            "uq_question_collection_access_one_owner_per_collection",
            "collection_id",
            unique=True,
            sqlite_where=text("access_level = 'OWNER'"),
            postgresql_where=text("access_level = 'OWNER'"),
        ),
    )

    id: UUID | None = Field(default_factory=uuid4, primary_key=True, index=True)
    collection_id: UUID = Field(
        sa_column=Column(
            ForeignKey("question_collection.id", ondelete="CASCADE"),
            nullable=False,
        ),
    )
    # Defines who granted who to what
    granted_by_id: UUID | None = Field(
        default=None,
        foreign_key="developer_profile.id",
    )

    developer_id: UUID = Field(foreign_key="developer_profile.id")
    access_level: AccessLevel

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
