import type { QuestionRead } from "../../types/questionTypes";

export type CollectionId = string;
export type QuestionId = string;

export type QuestionCollection = {
  id: CollectionId | null;
  owner_id: string | null;
  title: string;
  parent_id: CollectionId | null;
  children?: QuestionCollection[];
  created_at: string;
  updated_at: string;
};

export type QuestionCollectionRead = QuestionCollection & {
  question_ids: QuestionId[];
};

export type QuestionCollectionLink = {
  question_id: QuestionId | null;
  collection_id: CollectionId | null;
};

export type CreateCollectionPayload = {
  title: string;
  parent_id?: CollectionId | null;
};

export type UpdateCollectionPayload = {
  title?: string | null;
  parent_id?: CollectionId | null;
};

export type ListCollectionsParams = {
  offset?: number | null;
  limit?: number | null;
};

export type SearchCollectionsParams = {
  collection_id?: CollectionId | null;
  title?: string | null;
  offset?: number | null;
  limit?: number | null;
};

export type AddQuestionToCollectionPayload = {
  question_id: QuestionId;
};

export type CollectionQuestion = QuestionRead;
