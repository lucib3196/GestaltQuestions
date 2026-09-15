import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import { createCollectionSlice } from "../../../stores/collections";
import {
  createResourceAccessSlice,
  type AnyResourceSchema,
} from "../../../stores/resourceAccess";
import type { CollectionStore, CollectionStoreOptions } from "./state";

export const COLLECTION_EDITOR_PERSIST_KEY = "collection-settings:v1";

export function createCollectionStore<
  AccessSchema extends AnyResourceSchema = AnyResourceSchema,
>(options: CollectionStoreOptions = {}) {
  return createStore<CollectionStore<AccessSchema>>()(
    persist(
      (...args) => ({
        ...createResourceAccessSlice<AccessSchema>()(...args),
        ...createCollectionSlice()(...args),
      }),

      {
        name: options.persistKey ?? COLLECTION_EDITOR_PERSIST_KEY,
      },
    ),
  );
}
