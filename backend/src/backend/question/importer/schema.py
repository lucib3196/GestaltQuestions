from dataclasses import dataclass
from typing import Any
from uuid import UUID

from backend.question import QuestionCreate
from backend.storage import FileData


@dataclass
class QuestionPackage:
    """Normalized importer output ready for question persistence."""

    question: QuestionCreate
    files: list[FileData]
    source_question_id: str | UUID
    raw_metadata: dict[str, Any]
    source_type: str

