import { createStore } from "zustand";
import type { CollectionId, QuestionCollection } from "../../../services";
import { normalizeCollections } from "../utils/collectionTree";
import type { NormalizedCollections } from "./types";

export type QuestionCollectionState = {
  // Manages general state for the collections. Treated as a folder structure
  normalizedCollection: NormalizedCollections;
  // Handles any selected and the current expanded collections
  selectedCollectionId: CollectionId | null;
  expandedCollectionIds: Set<CollectionId>;
  selectedCollectionIds: Set<CollectionId>;
};

type QuestionCollectionActions = {
  // Gets the raw collection and normalizes it for me
  setNormalizeCollection: (collections: QuestionCollection[]) => void;
  setSelectedCollectionId: (collectionId: CollectionId | null) => void;
};

export type QuestionCollectionStore = QuestionCollectionState &
  QuestionCollectionActions;

const initialState: QuestionCollectionState = {
  normalizedCollection: {
    byId: {},
    rootIds: [],
    childIdsByParentId: {},
  },
  selectedCollectionId: null,

  expandedCollectionIds: new Set(),
  selectedCollectionIds: new Set(),
};

export function createCollectionStore(
  preloaded?: Partial<QuestionCollectionState>,
) {
  return createStore<QuestionCollectionStore>()((set) => ({
    ...initialState,
    ...preloaded,

    setNormalizeCollection: (collections) => {
      set({
        normalizedCollection: normalizeCollections(collections),
      });
    },

    setSelectedCollectionId: (collectionId) => {
      set({ selectedCollectionId: collectionId });
    },
  }));
}
