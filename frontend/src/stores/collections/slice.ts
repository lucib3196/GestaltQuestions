import type { StateCreator } from "zustand";

import type {
  CollectionId,
  QuestionCollectionRead,
} from "../../services/Collections/types";
import type {
  NormalizedCollections,
  QuestionCollectionState,
  QuestionCollectionStore,
} from "./state";

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

function normalizeCollections(
  collections: QuestionCollectionRead[],
): NormalizedCollections {
  const byId: Record<CollectionId, QuestionCollectionRead> = {};
  const rootIds: CollectionId[] = [];
  const childIdsByParentId: Record<CollectionId, CollectionId[]> = {};

  for (const collection of collections) {
    if (!collection.id) continue;
    byId[collection.id] = collection;
  }

  for (const collection of collections) {
    if (!collection.id) continue;
    if (!collection.parent_id || !byId[collection.parent_id]) {
      rootIds.push(collection.id);
      continue;
    }

    childIdsByParentId[collection.parent_id] ??= [];
    childIdsByParentId[collection.parent_id].push(collection.id);
  }

  return {
    byId,
    rootIds,
    childIdsByParentId,
  };
}

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
