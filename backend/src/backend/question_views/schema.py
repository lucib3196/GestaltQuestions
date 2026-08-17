from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.accounts import ValidInstitutions
from backend.question import QType, Status
from backend.question_runtime.model import RuntimeLanguage


class QuestionSearchParams(BaseModel):
    # Search query for title
    search: str | None = None
    # Filter question based on status
    status: Status | None = None
    # Filter based on institution
    institution: ValidInstitutions | None = None
    # filter question based on question type
    qtype: QType | list[QType] | None = None
    # general term for searching topics based on topics
    topic: str | None = None
    # Search the question based on runtime data
    language: RuntimeLanguage | list[RuntimeLanguage] | None = None
    # Backend-only filter for published table queries
    published: bool | None = None
    # Filter questions by collection membership
    collection_id: UUID | None = None
    collection_title: str | None = None

    isAdaptive: bool | None = None
    # General offset and limits
    limit: int = 50
    offset: int = 0


class QuestionTableRow(BaseModel):
    question_id: UUID
    user_id: UUID
    developer_profile_id: UUID
    title: str
    institution_id: UUID
    institution: str
    created_by: str
    status: Status | str
    topics: list[str | None] | None
    question_type: list[QType | str | None] | None
    available_runtimes: list[RuntimeLanguage | str]
    collection_id: UUID | None
    collection_title: str | None
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True)
class QuestionTableSearchContext:
    owner_id: UUID | None = None
    developer_profile_id: UUID | None = None
    collection_owner_id: UUID | None = None
