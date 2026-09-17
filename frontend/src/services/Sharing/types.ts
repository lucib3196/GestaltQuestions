import type {
  CollectionAccess,
  QuestionAccess,
  ShareableAccessLevel,
} from "../Access";

/* eslint-disable no-unused-vars */
export type BatchPayload<TKey extends string> = {
  [K in TKey]: string[];
} & {
  target_user_ids: string[];
  level: ShareableAccessLevel;
};

export type ShareBatchFailed<TKey extends string> = {
  [K in TKey]: string;
} & {
  target_user_id: string;
  reason: string;
};
/* eslint-enable no-unused-vars */

export type ShareBatchResult<AccessT, TKey extends string> = {
  shared: AccessT[];
  failed: ShareBatchFailed<TKey>[];
};

export type ShareQuestionsWithUsersPayload = BatchPayload<"question_ids">;

export type ShareQuestionFailure = ShareBatchFailed<"question_id">;

export type ShareQuestionBatchResult = ShareBatchResult<
  QuestionAccess,
  "question_id"
>;

export type ShareCollectionsWithUsersPayload = BatchPayload<"collection_ids">;

export type ShareCollectionFailure = ShareBatchFailed<"collection_id">;

export type ShareCollectionBatchResult = ShareBatchResult<
  CollectionAccess,
  "collection_id"
>;
