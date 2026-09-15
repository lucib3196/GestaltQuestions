import type { StateCreator } from "zustand";
import { normalizeCollections } from "./utils";

import type { QuestionCollectionState, QuestionCollectionStore } from "./state";

const initialCollectionState: QuestionCollectionState = {
  normalizedCollection: {
    byId: {},
    rootIds: [],
    childIdsByParentId: {},
  },
  selectedCollectionId: null,
  selectedCollection: null,

  expandedCollectionIds: new Set(),
  selectedCollectionIds: new Set(),
};

export type CollectionSliceCreator<
  Store extends QuestionCollectionStore = QuestionCollectionStore,
  Slice = QuestionCollectionStore,
> = StateCreator<Store, [], [], Slice>;

export function createCollectionSlice<
  Store extends QuestionCollectionStore = QuestionCollectionStore,
>(): CollectionSliceCreator<Store, QuestionCollectionStore> {
  return (set) => ({
    ...initialCollectionState,

    setNormalizeCollection: (collections) => {
      set({
        normalizedCollection: normalizeCollections(collections),
      } as Partial<Store>);
    },

    setSelectedCollectionId: (collectionId) => {
      set(
        (state) =>
          ({
            selectedCollectionId: collectionId,
            selectedCollection: collectionId
              ? state.normalizedCollection.byId[collectionId]
              : null,
          }) as Partial<Store>,
      );
    },
  });
}
