from pydantic import BaseModel

from backend.authorization import AccessLevel
from backend.shared import ID
from uuid import UUID
from .models import QuestionAccess


class QuestionAccessDetailRead(QuestionAccess):
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
    shared: list[QuestionAccess]
    failed: list[ShareQuestionFailure]


class UpdateQuestionAccessPayload(BaseModel):
    level: AccessLevel
