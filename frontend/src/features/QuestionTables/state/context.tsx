import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore, type StoreApi } from "zustand";

import { createTableStore } from "./store";
import type { TableStore } from "./types";

type AnyTableStoreApi = StoreApi<TableStore<any, any, any>>;

const QuestionTableContext = createContext<AnyTableStoreApi | null>(null);

type QuestionTableProviderProps<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
> = {
  children: ReactNode;
  initialState?: Partial<TableStore<Row, VirtualKey, Query>>;
};

export function QuestionTableProvider<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
>({
  children,
  initialState,
}: QuestionTableProviderProps<Row, VirtualKey, Query>) {
  const storeRef = useRef<StoreApi<TableStore<Row, VirtualKey, Query>> | null>(
    null,
  );

  if (!storeRef.current) {
    storeRef.current = createTableStore<Row, VirtualKey, Query>(initialState);
  }

  return (
    <QuestionTableContext.Provider value={storeRef.current as AnyTableStoreApi}>
      {children}
    </QuestionTableContext.Provider>
  );
}

export function useQuestionTableContext<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
  T = unknown,
>(selector: (state: TableStore<Row, VirtualKey, Query>) => T): T {
  const store = useContext(QuestionTableContext);

  if (!store) {
    throw new Error(
      "useQuestionTableContext must be used inside QuestionTableProvider",
    );
  }

  return useStore(
    store as StoreApi<TableStore<Row, VirtualKey, Query>>,
    selector,
  );
}
