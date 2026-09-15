import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import { createCollectionSlice } from "../../../stores/collections";
import { createResourceAccessSlice } from "../../../stores/resourceAccess";
import type { DeveloperCollectionAccessSchema } from "../access/types";
import type { CollectionStore, CollectionStoreOptions } from "./state";

export const COLLECTION_EDITOR_PERSIST_KEY = "collection-settings:v1";

export function createCollectionStore(options: CollectionStoreOptions = {}) {
  return createStore<CollectionStore>()(
    persist(
      (...args) => ({
        ...createResourceAccessSlice<
          DeveloperCollectionAccessSchema,
          CollectionStore
        >()(...args),
        ...createCollectionSlice<CollectionStore>()(...args),
      }),

      {
        name: options.persistKey ?? COLLECTION_EDITOR_PERSIST_KEY,
      },
    ),
  );
}
