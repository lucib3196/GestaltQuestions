import { createContext, type ReactNode, useContext, useRef } from "react";
import { type StoreApi, useStore } from "zustand";

import type { AnyTableSchema } from "../types";
import { createTableStore } from "./store";
import type { TableStore } from "./types";

type AnyTableStoreApi = StoreApi<TableStore<AnyTableSchema>>;

const TableBaseContext = createContext<AnyTableStoreApi | null>(null);

type TableBaseProviderProps<Schema extends AnyTableSchema = AnyTableSchema> = {
  children: ReactNode;
  initialState?: Partial<TableStore<Schema>>;
  persistKey?: string;
};

export function TableBaseProvider<
  Schema extends AnyTableSchema = AnyTableSchema,
>({
  children,
  initialState,
  persistKey = "table-settings",
}: TableBaseProviderProps<Schema>) {
  const storeRef = useRef<StoreApi<TableStore<Schema>> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createTableStore<Schema>({
      persistKey,
      preloaded: initialState,
    });
  }

  return (
    <TableBaseContext.Provider
      value={storeRef.current as unknown as AnyTableStoreApi}
    >
      {children}
    </TableBaseContext.Provider>
  );
}

export function useTableBaseContext<
  Schema extends AnyTableSchema = AnyTableSchema,
  T = unknown,
>(selector: (state: TableStore<Schema>) => T): T {
  const store = useContext(TableBaseContext);

  if (!store) {
    throw new Error(
      "useTableBaseContext must be used inside TableBaseProvider",
    );
  }

  return useStore(store as unknown as StoreApi<TableStore<Schema>>, selector);
}
