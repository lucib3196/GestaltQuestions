from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from backend.question_collections.model import QuestionCollection


class QuestionCollectionCreate(BaseModel):
    owner_id: UUID | str
    title: str
    parent_id: UUID | str | None = None


class QuestionCollectionUpdate(BaseModel):
    title: str | None = None
    parent_id: UUID | str | None = None


class QuestionCollectionRead(BaseModel):
    id: UUID | None
    owner_id: UUID | None
    title: str
    parent_id: UUID | None
    created_at: datetime
    updated_at: datetime
    question_ids: list[UUID] = Field(default_factory=list)

    @classmethod
    def from_collection(
        cls,
        collection: QuestionCollection,
        question_ids: list[UUID] | None = None,
    ) -> "QuestionCollectionRead":
        return cls(
            id=collection.id,
            owner_id=collection.owner_id,
            title=collection.title,
            parent_id=collection.parent_id,
            created_at=collection.created_at,
            updated_at=collection.updated_at,
            question_ids=question_ids or [],
        )
