import type {
  CollectionId,
  QuestionCollection,
  QuestionCollectionRead,
} from "../../services/Collections/types";

export type NormalizedCollections = {
  byId: Record<CollectionId, QuestionCollectionRead | QuestionCollection>;
  rootIds: CollectionId[];

  childIdsByParentId: Record<CollectionId, CollectionId[]>;
};

export type QuestionCollectionState = {
  // Manages general state for the collections. Treated as a folder structure
  normalizedCollection: NormalizedCollections;
  // Handles any selected and the current expanded collections
  selectedCollectionId: CollectionId | null;
  selectedCollection: QuestionCollection | QuestionCollectionRead | null;
  expandedCollectionIds: Set<CollectionId>;
  selectedCollectionIds: Set<CollectionId>;
};

export type QuestionCollectionActions = {
  // Gets the raw collection and normalizes it for me
  setNormalizeCollection: (
    collections: QuestionCollectionRead[] | QuestionCollection[],
  ) => void;
  setSelectedCollectionId: (collectionId: CollectionId | null) => void;
};

export type QuestionCollectionStore = QuestionCollectionState &
  QuestionCollectionActions;
