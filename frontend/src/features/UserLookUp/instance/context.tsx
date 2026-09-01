import {
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
} from "react";
import { useStore } from "zustand";

import {
  createUserLookupStore,
  type UserLookupState,
  type UserLookupStore,
} from "./store";

type UserLookupStoreApi = ReturnType<typeof createUserLookupStore>;

type UserLookupProviderProps = PropsWithChildren<{
  initialState?: Partial<UserLookupState>;
}>;

const UserLookupStoreContext = createContext<UserLookupStoreApi | null>(null);

export function UserLookupProvider({
  children,
  initialState,
}: UserLookupProviderProps) {
  const storeRef = useRef<UserLookupStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUserLookupStore(initialState);
  }

  return (
    <UserLookupStoreContext.Provider value={storeRef.current}>
      {children}
    </UserLookupStoreContext.Provider>
  );
}

export function useUserLookupStore<T>(
  selector: (state: UserLookupStore) => T,
) {
  const store = useContext(UserLookupStoreContext);

  if (!store) {
    throw new Error("useUserLookupStore must be used within UserLookupProvider");
  }

  return useStore(store, selector);
}
