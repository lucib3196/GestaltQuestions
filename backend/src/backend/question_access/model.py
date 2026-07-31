from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from enum import StrEnum


class AccessLevel(StrEnum):
    VIEW = "view"
    EDIT = "edit"
    FULL = "full"




class QuestionAccess(SQLModel, table=True):
    __tablename__ = "question_access"  # type: ignore
    id: UUID | None = Field(default_factory=uuid4, primary_key=True, index=True)
    # Maps the question id and the developer who has access
    question_id: UUID = Field(foreign_key="question.id")
    developer_id: UUID = Field(foreign_key="developer_profile.id")
    # Defines the access level
    access_level: AccessLevel
    
    # General timekeeping
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
