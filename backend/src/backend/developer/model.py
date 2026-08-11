from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from backend.auth import User
    from backend.question import Question


class DeveloperProfile(SQLModel, table=True):
    __tablename__ = "developer_profile"  # type: ignore

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)

    user: Optional["User"] = Relationship(back_populates="developer_profile")
    storage_path: str | None = None
    created_questions: list["Question"] = Relationship(
        back_populates="created_by",
    )
