export type AccessLevel = "view" | "edit" | "full" | "owner";

export type QuestionId = string;
export type CollectionId = string;
export type UserId = string;

export type ShareableAccessLevel = Exclude<AccessLevel, "owner">;

export type ShareAccessPayload = {
  target_user_id: UserId;
  level: ShareableAccessLevel;
};

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

export type UpdateShareAccessPayload = {
  level: ShareableAccessLevel;
};

export type ResourceAccessRevokeResult = {
  revoked: boolean;
  access_id: string | null;
  access_level: AccessLevel;
  owner_profile_id: string;
  target_profile_id: string;
  resource_id: string | null;
  resource_name: string;
  reason: string;
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

export type CollectionAccess = {
  id: string | null;
  collection_id: CollectionId;
  granted_by_id: string | null;
  developer_id: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
};
