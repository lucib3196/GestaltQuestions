import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import type { CollectionStore, CollectionStoreOptions } from "./state";
import { createCollectionStore } from "./store";

type CollectionStoreApi = ReturnType<typeof createCollectionStore>;

const CollectionContext = createContext<CollectionStoreApi | null>(null);

type CollectionProviderProps = CollectionStoreOptions & {
  children: ReactNode;
};

export function CollectionProvider({
  children,
  persistKey,
}: CollectionProviderProps) {
  const storeRef = useRef<CollectionStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createCollectionStore({ persistKey });
  }

  return (
    <CollectionContext.Provider value={storeRef.current}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollectionStore<T>(
  selector: (state: CollectionStore) => T,
): T {
  const store = useContext(CollectionContext);

  if (!store) {
    throw new Error(
      "useCollectionStore must be used inside CollectionProvider",
    );
  }

  return useStore(store, selector);
}
