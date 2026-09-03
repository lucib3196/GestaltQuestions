from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from backend.accounts import ValidInstitutions
from backend.question import QType, Status
from backend.question_runtime.model import RuntimeLanguage
import json
from .utils import coerce_str_enum, normalize_list


class QuestionSearchParamsBase(BaseModel):
    search: str | None = Field(default=None, description="Search query for title")
    status: Status | None = Field(
        default=None, description="Filter questions based on status"
    )
    topic: str | None = Field(
        default=None, description="General term for searching topics"
    )
    qtype: QType | list[QType] | None = Field(
        default=None, description="Filter based on question type"
    )
    language: RuntimeLanguage | list[RuntimeLanguage] | None = Field(
        default=None,
        description="Search questions based on runtime language",
    )
    isAdaptive: bool | None = Field(
        default=None, description="Filter questions based on adaptive status"
    )

    limit: int = Field(
        default=1000, description="Maximum number of questions to return"
    )
    offset: int = Field(default=0, description="Number of questions to skip")


class QuestionSearchParams(QuestionSearchParamsBase):
    description: str | None = None
    institution: ValidInstitutions | None = None
    published: bool | None = None
    collection_id: UUID | None = None
    collection_title: str | None = None


class QuestionTableRowBase(BaseModel):
    question_id: UUID
    title: str | None
    isAdaptive: bool
    status: Status | str
    topics: list[str | None] | None
    question_type: list[QType | None] | None
    available_runtimes: list[RuntimeLanguage | None] | None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    @field_validator("topics", "question_type", "available_runtimes", mode="before")
    @classmethod
    def normalize_array_fields(cls, value: Any) -> list[Any] | None:
        return normalize_list(value)

    @field_validator("available_runtimes", mode="before")
    @classmethod
    def normalize_runtime_languages(cls, value: Any) -> list[Any] | None:
        values = normalize_list(value)
        if values is None:
            return None

        return [coerce_str_enum(item, RuntimeLanguage) for item in values]

    @field_validator("question_type", mode="before")
    @classmethod
    def normalize_question_types(cls, value: Any) -> list[Any] | None:
        values = normalize_list(value)
        if values is None:
            return None

        return [coerce_str_enum(item, QType) for item in values]


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
