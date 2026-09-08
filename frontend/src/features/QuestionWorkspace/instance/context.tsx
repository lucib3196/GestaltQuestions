import { createContext, type ReactNode, useContext, useRef } from "react";
import { type StoreApi, useStore } from "zustand";
import type { AnyResourceSchema } from "../../ResourceAccess/types";
import { createWorkspaceStore } from "./store";
import type { WorkspaceStore } from "./types";
type AnyWorkspaceStoreAPI = StoreApi<WorkspaceStore>;
const WorkspaceContext = createContext<AnyWorkspaceStoreAPI | null>(null);

type WorkspaceProviderProps = {
  children: ReactNode;
  persistKey?: string;
};

export function WorkspaceBaseProvider<
  Schema extends AnyResourceSchema = AnyResourceSchema,
>({ children, persistKey = "workspacev1" }: WorkspaceProviderProps) {
  const storeRef = useRef<StoreApi<WorkspaceStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createWorkspaceStore<Schema>({
      persistKey,
    });
  }
  return (
    <WorkspaceContext.Provider
      value={storeRef.current as unknown as AnyWorkspaceStoreAPI}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext<
  Schema extends AnyResourceSchema = AnyResourceSchema,
  T = unknown,
>(selector: (state: WorkspaceStore<Schema>) => T): T {
  const store = useContext(WorkspaceContext);

  if (!store) {
    throw new Error(
      "useTableBaseContext must be used inside TableBaseProvider",
    );
  }

  return useStore(
    store as unknown as StoreApi<WorkspaceStore<Schema>>,
    selector,
  );
}
