from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.question import QType, Status
from backend.question_runtime.model import RuntimeLanguage


class QuestionTableRow(BaseModel):
    question_id: UUID
    user_id: UUID
    isAdaptive: bool
    developer_profile_id: UUID
    title: str
    institution_id: UUID
    institution: str
    created_by: str
    status: Status | str
    topics: list[str | None] | None
    question_type: list[QType | str | None]
    available_runtimes: list[RuntimeLanguage | str]
    collection_id: UUID | None
    collection_title: str | None
    created_at: datetime | None = None
    updated_at: datetime | None = None
