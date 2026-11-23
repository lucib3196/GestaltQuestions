from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from backend.authorization import AccessLevel
from backend.shared import ID


class QuestionAccessRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID | None
    question_id: UUID
    granted_by_id: UUID | None = None
    developer_id: UUID
    access_level: AccessLevel
    created_at: datetime
    updated_at: datetime


class QuestionAccessDetailRead(QuestionAccessRead):
    user_id: UUID
    email: str
    first_name: str
    last_name: str
    username: str | None = None


class ShareQuestionAccessPayload(BaseModel):
    target_user_id: ID
    level: AccessLevel


class ShareQuestionsWithUsersPayload(BaseModel):
    question_ids: list[ID]
    target_user_ids: list[ID]
    level: AccessLevel


class ShareQuestionFailure(BaseModel):
    question_id: ID
    target_user_id: ID
    reason: str


class ShareQuestionBatchResult(BaseModel):
    shared: list[QuestionAccessRead]
    failed: list[ShareQuestionFailure]


class UpdateQuestionAccessPayload(BaseModel):
    level: AccessLevel
