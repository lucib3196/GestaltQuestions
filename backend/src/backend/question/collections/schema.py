from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from backend.question.collections.models import QuestionCollection, Status


class CollectionCustomization(BaseModel):
    model_config = ConfigDict(extra="forbid")

    color: str | None = None
    icon: str | None = None
    schema_version: Literal[1] = 1


class QuestionCollectionCreate(BaseModel):
    title: str
    description: str | None = None
    customization: CollectionCustomization = Field(
        default_factory=CollectionCustomization
    )
    parent_id: str | UUID | None = None


class QuestionCollectionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Status | None = None
    customization: CollectionCustomization | None = None
    parent_id: UUID | str | None = None


class QuestionCollectionRead(BaseModel):
    id: UUID | None
    owner_id: UUID | None
    title: str
    status: Status | None
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
            status=collection.status,
            description=collection.description,
            customization=(
                CollectionCustomization.model_validate(collection.customization)
                if collection.customization
                else None
            ),
            parent_id=collection.parent_id,
            created_at=collection.created_at,
            updated_at=collection.updated_at,
            question_ids=question_ids or [],
            subcollections_len=len(collection.children),
        )
