from uuid import UUID

from pydantic import BaseModel


class QuestionCollectionCreate(BaseModel):
    owner_id: UUID | str
    title: str
    parent_id: UUID | str | None = None


class QuestionCollectionUpdate(BaseModel):
    title: str | None = None
    parent_id: UUID | str | None = None
