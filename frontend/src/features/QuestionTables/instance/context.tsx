import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import { createQuestionTableStore } from "./store";
import type { QuestionTableState, QuestionTableStore } from "./types";

type QuestionTableStoreApi = ReturnType<typeof createQuestionTableStore>;
const QuestionTableContext = createContext<QuestionTableStoreApi | null>(null);


type QuestionTableProviderProps = {
  children: ReactNode;
  initialState?: Partial<QuestionTableState>;
};
export function QuestionTableProvider({
  children,
  initialState,
}: QuestionTableProviderProps) {
  const storeRef = useRef<QuestionTableStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createQuestionTableStore(initialState);
  }

  return (
    <QuestionTableContext.Provider value={storeRef.current}>
      {children}
    </QuestionTableContext.Provider>
  );
}
export function useQuestionTableContext<T>(
  selector: (state: QuestionTableStore) => T,
): T {
  const store = useContext(QuestionTableContext);

  if (!store) {
    throw new Error(
      "useQuestionTableContext must be used inside QuestionTableProvider",
    );
  }

  return useStore(store, selector);
}


