import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore, type StoreApi } from "zustand";

import { createTableStore } from "./store";
import type { TableStore } from "./types";

type AnyTableStoreApi = StoreApi<TableStore<any, any, any>>;

const TableBaseContext = createContext<AnyTableStoreApi | null>(null);

type TableBaseProviderProps<
  Row,
  VirtualKey extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
> = {
  children: ReactNode;
  initialState?: Partial<TableStore<Row, VirtualKey, Query>>;
  persistKey?: string;
};

export function TableBaseProvider<
  Row,
  VirtualKey extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
>({
  children,
  initialState,
  persistKey = "table-settings",
}: TableBaseProviderProps<Row, VirtualKey, Query>) {
  const storeRef = useRef<StoreApi<TableStore<Row, VirtualKey, Query>> | null>(
    null,
  );

  if (!storeRef.current) {
    storeRef.current = createTableStore<Row, VirtualKey, Query>({
      persistKey,
      preloaded: initialState,
    });
  }

  return (
    <TableBaseContext.Provider value={storeRef.current as AnyTableStoreApi}>
      {children}
    </TableBaseContext.Provider>
  );
}

export function useTableBaseContext<
  Row,
  VirtualKey extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
  T = unknown,
>(selector: (state: TableStore<Row, VirtualKey, Query>) => T): T {
  const store = useContext(TableBaseContext);

  if (!store) {
    throw new Error(
      "useTableBaseContext must be used inside TableBaseProvider",
    );
  }

  return useStore(
    store as StoreApi<TableStore<Row, VirtualKey, Query>>,
    selector,
  );
}

export { TableBaseProvider as QuestionTableProvider };
export { useTableBaseContext as useQuestionTableContext };
