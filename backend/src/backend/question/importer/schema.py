from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from gdrive_importer.models import GDriveFile
from sqlalchemy import Column, UniqueConstraint
from sqlmodel import Field as SQLField, SQLModel

if TYPE_CHECKING:
    pass
@dataclass
class DriveQuestionPackage:
    """Files discovered for one legacy Drive-backed question folder."""

    parent_id: str
    files: dict[str, GDriveFile]
    
class QuestionSourceReference(SQLModel, table=True):
    __tablename__ = "question_source_reference"  # type: ignore
    id: UUID = SQLField(default_factory=uuid4, primary_key=True)
    __table_args__ = (
        UniqueConstraint(
            "question_id",
            "source_question_id",
            name="uq_question_source_reference_source_question",
        ),
    )
    question_id: UUID = SQLField(foreign_key="question.id", index=True)
    source_question_id: str = SQLField(index=True)  # info.json uuid

    raw_metadata: dict[str, Any] = SQLField(
        sa_column=Column(JSONType, nullable=False)
    )  # Stores the raw info.json
    imported_at: datetime = SQLField(default_factory=datetime.now)