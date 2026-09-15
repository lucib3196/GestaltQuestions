import { createContext, type ReactNode, useContext, useRef } from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";

import { createCollectionSlice } from "./slice";
import type { QuestionCollectionState, QuestionCollectionStore } from "./state";

type CollectionStoreApi = ReturnType<typeof createCollectionStore>;
const CollectionContext = createContext<CollectionStoreApi | null>(null);

type CollectionProviderProps = {
  children: ReactNode;
  initialState?: Partial<QuestionCollectionState>;
};

export function createCollectionStore(
  preloaded?: Partial<QuestionCollectionState>,
) {
  return createStore<QuestionCollectionStore>()((...args) => ({
    ...createCollectionSlice<QuestionCollectionStore>()(...args),
    ...preloaded,
  }));
}

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
