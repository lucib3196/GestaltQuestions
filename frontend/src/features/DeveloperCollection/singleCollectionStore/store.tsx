import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import { createCollectionSlice } from "../../../stores/collections";
import { createResourceAccessSlice } from "../../../stores/resourceAccess";
import type { DeveloperCollectionAccessSchema } from "../access/types";
import type {
  SingleCollectionStore,
  SingleCollectionStoreOptions,
} from "./state";

export const SINGLE_COLLECTION_STORE_PERSIST_KEY = "single-collection:v1";

export function createSingleCollectionStore(
  options: SingleCollectionStoreOptions = {},
) {
  return createStore<SingleCollectionStore>()(
    persist(
      (...args) => ({
        ...createResourceAccessSlice<
          DeveloperCollectionAccessSchema,
          SingleCollectionStore
        >()(...args),
        ...createCollectionSlice<SingleCollectionStore>()(...args),
      }),

      {
        name: options.persistKey ?? SINGLE_COLLECTION_STORE_PERSIST_KEY,
      },
    ),
  );
}
