import type {
  AccessLevel,
  ResourceAccessRevokeResult,
  ShareableAccessLevel,
  ShareAccessPayload,
  UpdateShareAccessPayload,
  UserId,
} from "../types";

export type {
  AccessLevel,
  ResourceAccessRevokeResult,
  ShareableAccessLevel,
  ShareAccessPayload,
  UpdateShareAccessPayload,
  UserId,
};

export type QuestionId = string;

export type ShareQuestionsWithUsersPayload = {
  question_ids: QuestionId[];
  target_user_ids: UserId[];
  level: ShareableAccessLevel;
};

export type ShareQuestionFailure = {
  question_id: QuestionId;
  target_user_id: UserId;
  reason: string;
};

export type ShareQuestionBatchResult = {
  shared: QuestionAccess[];
  failed: ShareQuestionFailure[];
};

export type QuestionAccess = {
  id: string | null;
  question_id: QuestionId;
  granted_by_id: string | null;
  developer_id: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
};

export type QuestionAccessDetailRead = QuestionAccess & {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string | null;
};
