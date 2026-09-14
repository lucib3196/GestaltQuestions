from datetime import datetime
from uuid import UUID
from typing import Literal, Any
from pydantic import BaseModel, Field

from backend.question.collections.models import QuestionCollection
from pydantic import BaseModel, ConfigDict


class CollectionCustomization(BaseModel):
    model_config = ConfigDict(extra="forbid")

    color: str | None = None
    icon: str | None = None
    schema_version: Literal[1] = 1


class QuestionCollectionCreate(BaseModel):
    title: str
    description: str | None = None
    customization: dict[str, Any] | CollectionCustomization = Field(
        default_factory=dict
    )
    parent_id: str | UUID | None = None


class QuestionCollectionUpdate(BaseModel):
    title: str | None = None
    parent_id: UUID | str | None = None


class QuestionCollectionRead(BaseModel):
    id: UUID | None
    owner_id: UUID | None
    title: str
    description: str | None
    customization: CollectionCustomization | None
    parent_id: UUID | None
    created_at: datetime
    updated_at: datetime
    question_ids: list[UUID] = Field(default_factory=list)
    subcollections_len: int

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
            description=collection.description,
            customization=(
                CollectionCustomization.model_validate(**collection.customization)
                if collection.customization
                else None
            ),
            parent_id=collection.parent_id,
            created_at=collection.created_at,
            updated_at=collection.updated_at,
            question_ids=question_ids or [],
            subcollections_len=len(collection.children),
        )
