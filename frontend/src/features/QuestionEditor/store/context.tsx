import { createContext, type ReactNode, useContext, useRef } from "react";
import { type StoreApi, useStore } from "zustand";

import type { AnyResourceSchema } from "../../../stores/resourceAccess";
import type { QuestionEditorAccessSchema } from "../access/types";
import { createQuestionEditorStore, QUESTION_EDITOR_PERSIST_KEY } from "./store";
import type { QuestionEditorStore } from "./types";
type AnyQuestionEditorStoreAPI = StoreApi<QuestionEditorStore>;
const QuestionEditorContext = createContext<AnyQuestionEditorStoreAPI | null>(
  null,
);

type QuestionEditorProviderProps = {
  children: ReactNode;
  persistKey?: string;
};

export function QuestionEditorProvider<
  Schema extends AnyResourceSchema = AnyResourceSchema,
>({
  children,
  persistKey = QUESTION_EDITOR_PERSIST_KEY,
}: QuestionEditorProviderProps) {
  const storeRef = useRef<AnyQuestionEditorStoreAPI | null>(null);
  if (!storeRef.current) {
    storeRef.current = createQuestionEditorStore<Schema>({
      persistKey,
    }) as unknown as AnyQuestionEditorStoreAPI;
  }
  return (
    <QuestionEditorContext.Provider value={storeRef.current}>
      {children}
    </QuestionEditorContext.Provider>
  );
}

export function useQuestionEditorStoreContext<
  Schema extends AnyResourceSchema = AnyResourceSchema,
  T = unknown,
>(selector: (state: QuestionEditorStore<Schema>) => T): T {
  const store = useContext(QuestionEditorContext);

  if (!store) {
    throw new Error(
      "useQuestionEditorStoreContext must be used inside QuestionEditorProvider",
    );
  }

  return useStore(
    store as unknown as StoreApi<QuestionEditorStore<Schema>>,
    selector,
  );
}

export function useQuestionEditorContext<T>(
  selector: (state: QuestionEditorStore<QuestionEditorAccessSchema>) => T,
): T {
  return useQuestionEditorStoreContext<QuestionEditorAccessSchema, T>(selector);
}
