import { create } from "zustand";
import type {
  CollectionId,
  CollectionQuestion,
  QuestionCollection,
} from "../../../services";
import { normalizeCollections } from "../utils/collectionTree";
import type { NormalizedCollections } from "./types";

type QuestionCollectionState = {
  // Manages general state for the collections. Treated as a folder structure
  normalizedCollection: NormalizedCollections;
  // Handles any selected and the current expanded collections
  expandedCollectionIds: Set<CollectionId>;
  selectedCollectionIds: Set<CollectionId>;
  // Question + Collections + cache
  qByCollectionIds: Record<CollectionId, CollectionQuestion[]>;
  loadedQCollectionIds: Set<CollectionId>;
  loadingQCollectionIds: Set<CollectionId>;
};

type QuestionCollectionActions = {
  // Gets the raw collection and normalizes it for me
  setNormalizeCollection: (collections: QuestionCollection[]) => void;

  // Setting the Question + Collections
  setLoadingQCollectionIds: (collectionId: CollectionId) => void;
  setLoadedQCollectionIds: (
    collectionId: CollectionId,
    questions: CollectionQuestion[],
  ) => void;
  clearLoadingQCollectionIds: (collectionId: CollectionId) => void;
};

type QuestionCollectionStore = QuestionCollectionState &
  QuestionCollectionActions;

const initialState: QuestionCollectionState = {
  normalizedCollection: {
    byId: {},
    rootIds: [],
    childIdsByParentId: {},
  },

  expandedCollectionIds: new Set(),
  selectedCollectionIds: new Set(),

  qByCollectionIds: {},
  loadedQCollectionIds: new Set(),
  loadingQCollectionIds: new Set(),
};

export const useQuestionCollectionStore = create<QuestionCollectionStore>(
  (set) => ({
    ...initialState,

    setNormalizeCollection: (colletions) => {
      let norm = normalizeCollections(colletions);
      set({
        normalizedCollection: norm,
      });
    },

    setLoadingQCollectionIds: (collectionId) => {
      set((state) => {
        const loading = new Set(state.loadingQCollectionIds);
        loading.add(collectionId);

        return {
          loadingQCollectionIds: loading,
        };
      });
    },

    setLoadedQCollectionIds: (collectionId, questions) => {
      set((state) => {
        const loading = new Set(state.loadingQCollectionIds);
        loading.delete(collectionId);

        const loaded = new Set(state.loadedQCollectionIds);
        loaded.add(collectionId);

        return {
          qByCollectionIds: {
            ...state.qByCollectionIds,
            [collectionId]: questions,
          },
          loadingQCollectionIds: loading,
          loadedQCollectionIds: loaded,
        };
      });
    },

    clearLoadingQCollectionIds: (collectionId) => {
      set((state) => {
        const loading = new Set(state.loadingQCollectionIds);
        loading.delete(collectionId);

        return {
          loadingQCollectionIds: loading,
        };
      });
    },
  }),
);
