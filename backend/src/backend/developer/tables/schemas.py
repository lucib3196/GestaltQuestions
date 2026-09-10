from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, field_validator

from backend.authorization import AccessLevel
from backend.question.views.schema import QuestionTableRowBase
from backend.question.views.utils import coerce_str_enum, normalize_list


class PersonalQuestionTableRow(QuestionTableRowBase):
    """Row returned by the personal question table."""


class PublishedQuestionTableRow(QuestionTableRowBase):
    """Row returned by the published personal question table."""


class PersonalCollectionTableRow(BaseModel):
    """Row returned by the personal collection table."""

    id: UUID | None
    owner_id: UUID | None
    title: str
    parent_id: UUID | None
    question_count: int
    created_at: datetime
    updated_at: datetime


class SharedQuestionTableRowBase(QuestionTableRowBase):
    access_levels: list[AccessLevel | str]

    @field_validator("access_levels", mode="before")
    @classmethod
    def normalize_access_levels(cls, value: Any) -> list[Any] | None:
        values = normalize_list(value)
        if values is None:
            return None

        return [coerce_str_enum(item, AccessLevel) for item in values]


class SharedWithMeQuestionTableRow(SharedQuestionTableRowBase):
    """Row returned by the shared-with-me question table."""

    granted_by_email: str
    granted_to_emails: list[str]
    shared_at: datetime

    @field_validator("granted_to_emails", mode="before")
    @classmethod
    def normalize_granted_to_emails(cls, value: Any) -> list[Any] | None:
        return normalize_list(value)


class SharedByMeQuestionTableRow(SharedQuestionTableRowBase):
    """Row returned by the shared-by-me question table."""

    granted_by_email: str | None
    granted_to_emails: list[str | None]
    member_ids: list[UUID | None]
    shared_at: datetime | None

    @field_validator("granted_to_emails", "member_ids", mode="before")
    @classmethod
    def normalize_shared_by_me_array_fields(cls, value: Any) -> list[Any] | None:
        return normalize_list(value)
