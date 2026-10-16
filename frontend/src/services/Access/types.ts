export type AccessLevel = "view" | "edit" | "full" | "owner";
export type ShareableAccessLevel = Exclude<AccessLevel, "owner">;

export type UserId = string;
export type QuestionId = string;
export type CollectionId = string;

/* eslint-disable no-unused-vars */
export type ResourceAccess<TKey extends string> = {
  [K in TKey]: string;
} & {
  id: string | null;
  granted_by_id: string | null;
  developer_id: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
};
/* eslint-enable no-unused-vars */

export type QuestionAccess = ResourceAccess<"question_id">;
export type CollectionAccess = ResourceAccess<"collection_id">;

export type QuestionAccessDetailRead = QuestionAccess & {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string | null;
};

export type ShareAccessPayload = {
  target_user_id: UserId;
  level: ShareableAccessLevel;
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
