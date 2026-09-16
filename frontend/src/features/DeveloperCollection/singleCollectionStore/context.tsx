import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import type {
  SingleCollectionStore,
  SingleCollectionStoreOptions,
} from "./state";
import { createSingleCollectionStore } from "./store";

type SingleCollectionStoreApi = ReturnType<typeof createSingleCollectionStore>;

const SingleCollectionContext =
  createContext<SingleCollectionStoreApi | null>(null);

type SingleCollectionProviderProps = SingleCollectionStoreOptions & {
  children: ReactNode;
};

export function SingleCollectionProvider({
  children,
  persistKey,
}: SingleCollectionProviderProps) {
  const storeRef = useRef<SingleCollectionStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createSingleCollectionStore({ persistKey });
  }

  return (
    <SingleCollectionContext.Provider value={storeRef.current}>
      {children}
    </SingleCollectionContext.Provider>
  );
}

export function useSingleCollectionStore<T>(
  selector: (state: SingleCollectionStore) => T,
): T {
  const store = useContext(SingleCollectionContext);

  if (!store) {
    throw new Error(
      "useSingleCollectionStore must be used inside SingleCollectionProvider",
    );
  }

  return useStore(store, selector);
}
