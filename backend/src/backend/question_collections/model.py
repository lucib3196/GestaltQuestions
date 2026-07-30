from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    pass


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
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class QuestionCollectionLink(SQLModel, table=True):
    __tablename__ = "question_collection_link"  # type: ignore

    question_id: UUID | None = Field(
        default=None,
        foreign_key="question.id",
        primary_key=True,
    )
    collection_id: UUID | None = Field(
        default=None,
        foreign_key="question_collection.id",
        primary_key=True,
    )
