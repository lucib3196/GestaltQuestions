from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from uuid import UUID
from sqlmodel import Field, Relationship, SQLModel
from uuid import uuid4

if TYPE_CHECKING:
    from backend.question.models import Question


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

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QuestionCollectionLink(SQLModel, table=True):
    __tablename__= "question_collection_link"  # type: ignore

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
