import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import type { AnyTableSchema } from "../types";
import { createTableSessionSlice } from "./slices/sessionSlice";
import { createTableSettingsSlice } from "./slices/settingsSlice";
import type { TableStore } from "./types";

export function createTableStore<
  Schema extends AnyTableSchema = AnyTableSchema,
>(options: { persistKey: string; preloaded?: Partial<TableStore<Schema>> }) {
  return createStore<TableStore<Schema>>()(
    persist(
      (...args) => ({
        ...createTableSettingsSlice<Schema>()(...args),
        ...createTableSessionSlice<Schema>()(...args),
        ...options.preloaded,
      }),
      {
        name: options.persistKey,
        partialize: (state) => ({
          search: state.search,
          columnVisibility: state.columnVisibility,
          columnFilters: state.columnFilters,
          rowsPerPage: state.rowsPerPage,
        }),
      },
    ),
  );
}
