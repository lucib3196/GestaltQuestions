import { createContext, type ReactNode, useContext, useRef } from "react";
import { type StoreApi, useStore } from "zustand";

import type { AnyResourceSchema } from "../../../stores/resourceAccess";
import type { QuestionWorkspaceAccessSchema } from "../access/types";
import { createWorkspaceStore, QUESTION_WORKSPACE_PERSIST_KEY } from "./store";
import type { WorkspaceStore } from "./types";
type AnyWorkspaceStoreAPI = StoreApi<WorkspaceStore>;
const WorkspaceContext = createContext<AnyWorkspaceStoreAPI | null>(null);

type WorkspaceProviderProps = {
  children: ReactNode;
  persistKey?: string;
};

export function WorkspaceBaseProvider<
  Schema extends AnyResourceSchema = AnyResourceSchema,
>({
  children,
  persistKey = QUESTION_WORKSPACE_PERSIST_KEY,
}: WorkspaceProviderProps) {
  const storeRef = useRef<AnyWorkspaceStoreAPI | null>(null);
  if (!storeRef.current) {
    storeRef.current = createWorkspaceStore<Schema>({
      persistKey,
    }) as unknown as AnyWorkspaceStoreAPI;
  }
  return (
    <WorkspaceContext.Provider value={storeRef.current}>
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
      "useWorkspaceContext must be used inside WorkspaceBaseProvider",
    );
  }

  return useStore(
    store as unknown as StoreApi<WorkspaceStore<Schema>>,
    selector,
  );
}

export function useQuestionWorkspaceContext<T>(
  selector: (state: WorkspaceStore<QuestionWorkspaceAccessSchema>) => T,
): T {
  return useWorkspaceContext<QuestionWorkspaceAccessSchema, T>(selector);
}
