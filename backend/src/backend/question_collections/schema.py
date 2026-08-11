from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QuestionCollectionCreate(BaseModel):
    owner_id: UUID | str
    title: str
    parent_id: UUID | str | None = None


class QuestionCollectionUpdate(BaseModel):
    title: str | None = None
    parent_id: UUID | str | None = None


class QuestionCollectionRead(BaseModel):
    id: UUID
    owner_id: UUID
    title: str
    parent_id: UUID | None
    created_at: datetime
    updated_at: datetime
    question_ids: list[UUID] = Field(default_factory=list)
