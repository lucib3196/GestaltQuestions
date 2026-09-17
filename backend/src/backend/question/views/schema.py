from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, ValidationInfo, field_validator

from backend.accounts import ValidInstitutions
from backend.question import QType, Status
from backend.question_runtime.model import RuntimeLanguage

from .utils import coerce_str_enum, normalize_list

EnumMap = dict[str, type[StrEnum]]


class QuestionSearchParamsBase(BaseModel):
    question_id: UUID | None = Field(
        default=None, description="Filter questions based on question id"
    )
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
    institution: ValidInstitutions | None = None
    published: bool | None = None
    collection_id: UUID | None = None
    collection_title: str | None = None


ENUM_FIELDS: EnumMap = {
    "available_runtimes": RuntimeLanguage,
    "question_type": QType,
}


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
    def normalize_array_fields(
        cls, value: Any, info: ValidationInfo
    ) -> list[Any] | None:
        values = normalize_list(value)

        enum_type = ENUM_FIELDS.get(info.field_name or "", None)
        if enum_type is None or values is None:
            return values

        return [coerce_str_enum(item, enum_type) for item in values]
