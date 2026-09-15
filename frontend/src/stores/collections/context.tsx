import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import {
  createCollectionStore,
  type QuestionCollectionState,
  type QuestionCollectionStore,
} from "./store";

type CollectionStoreApi = ReturnType<typeof createCollectionStore>;
const CollectionContext = createContext<CollectionStoreApi | null>(null);

type CollectionProviderProps = {
  children: ReactNode;
  initialState?: Partial<QuestionCollectionState>;
};

export function CollectionProvider({
  children,
  initialState,
}: CollectionProviderProps) {
  const storeRef = useRef<CollectionStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createCollectionStore(initialState);
  }
  return (
    <CollectionContext.Provider value={storeRef.current}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollectionStore<T>(
  selector: (state: QuestionCollectionStore) => T,
): T {
  const store = useContext(CollectionContext);

  if (!store) {
    throw new Error(
      "useCollectionStore must be used inside useCollectionStore",
    );
  }

  return useStore(store, selector);
}
