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

  // Handles any selected or expanded collections
  expandedCollectionIds: Set<CollectionId>;
  selectedCollectionIds: Set<CollectionId>;

  // Question + Collections + cache
  questionByCollectionId: Record<CollectionId, CollectionQuestion[]>;
  loadedQuestionCollectionIds: Set<CollectionId>;
  loadingQuestionCollectionIds: Set<CollectionId>;

  // Handle Error States
  collectionsError: string | null;
  questionErrorsByCollectionId: Record<CollectionId, string>;
};

type QuestionCollectionActions = {
  setCollections: (collections: QuestionCollection[]) => void;
  toggleSelectedCollection: (collectionId: CollectionId) => void;
  setSelectedCollectionIds: (collectionIds: CollectionId[]) => void;

  //   Setting Question Loading
  setCollectionQuestionsLoading: (collectionId: CollectionId) => void;
  setCollectionQuestionsLoaded: (
    collectionId: CollectionId,
    questions: CollectionQuestion[],
  ) => void;

  clearSelectedCollections: () => void;

  //   Setting errors
  setCollectionsError: (error: string) => void;
  setCollectionQuestionsError: (
    collectionId: CollectionId,
    error: string,
  ) => void;
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

  questionByCollectionId: {},
  loadedQuestionCollectionIds: new Set(),
  loadingQuestionCollectionIds: new Set(),

  collectionsError: null,
  questionErrorsByCollectionId: {},
};

export const useQuestionCollectionStore = create<QuestionCollectionStore>(
  (set) => ({
    ...initialState,

    setCollections: (colletions) => {
      let norm = normalizeCollections(colletions);
      set({
        normalizedCollection: norm,
      });
    },
    toggleSelectedCollection: (id) => {
      set({
        selectedCollectionIds: new Set([id]),
      });
    },
    setSelectedCollectionIds: (ids) => {
      set({ selectedCollectionIds: new Set(ids) });
    },

    setCollectionQuestionsLoading: (collectionId) => {
      set((state) => {
        const loading = new Set(state.loadingQuestionCollectionIds);
        loading.add(collectionId);

        const errors = { ...state.questionErrorsByCollectionId };
        delete errors[collectionId];

        return {
          loadingQuestionCollectionIds: loading,
          questionErrorsByCollectionId: errors,
        };
      });
    },

    setCollectionQuestionsLoaded: (collectionId, questions) => {
      set((state) => {
        const loading = new Set(state.loadingQuestionCollectionIds);
        loading.delete(collectionId);

        const loaded = new Set(state.loadedQuestionCollectionIds);
        loaded.add(collectionId);

        const errors = { ...state.questionErrorsByCollectionId };
        delete errors[collectionId];

        return {
          questionByCollectionId: {
            ...state.questionByCollectionId,
            [collectionId]: questions,
          },
          loadingQuestionCollectionIds: loading,
          loadedQuestionCollectionIds: loaded,
          questionErrorsByCollectionId: errors,
        };
      });
    },
    clearSelectedCollections: () => {
      set({ selectedCollectionIds: new Set() });
    },

    setCollectionsError: (err) => {
      set({ collectionsError: err });
    },
    setCollectionQuestionsError: (collectionId, error) => {
      set((state) => {
        const loading = new Set(state.loadingQuestionCollectionIds);
        loading.delete(collectionId);

        return {
          loadingQuestionCollectionIds: loading,
          questionErrorsByCollectionId: {
            ...state.questionErrorsByCollectionId,
            [collectionId]: error,
          },
        };
      });
    },
  }),
);
