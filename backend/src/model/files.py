from pathlib import Path
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from pydantic import BaseModel
from sqlmodel import Field, SQLModel

if TYPE_CHECKING:
    pass


class FileData(BaseModel):
    filename: str
    content: dict | str | Any | bytes
    mime_type: str = "application/octet-stream"


class FilesData(BaseModel):
    files: list[FileData]


class SuccessFileServiceResponse(BaseModel):
    status: int
    detail: str | Path | None = None
    path: str


class Folder(SQLModel):
    __tablename__ = "folder"  # type: ignore
    id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID | None = Field(default=None, foreign_key="user.id", primary_key=True)
    name: str
    parent_id: None = Field(default=None)
    full_path: str | None = Field(default=None)
