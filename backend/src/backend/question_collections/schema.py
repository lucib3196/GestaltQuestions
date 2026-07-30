from pydantic import BaseModel
from uuid import UUID
from .model import QuestionCollection
from typing import Optional


class QuestionCollectionCreate(BaseModel):
    owner_id: UUID | str
    title: str
    parent_id: UUID | str | None = None
