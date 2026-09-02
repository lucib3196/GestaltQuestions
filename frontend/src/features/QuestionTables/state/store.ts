import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import { createTableSettingsSlice } from "./slices/settingsSlice";
import { createTableSessionSlice } from "./slices/sessionSlice";
import type { TableStore } from "./types";

export function createTableStore<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
>(options: {
  persistKey: string;
  preloaded?: Partial<TableStore<Row, VirtualKey, Query>>;
}) {
  return createStore<TableStore<Row, VirtualKey, Query>>()(
    persist(
      (...args) => ({
        ...createTableSettingsSlice<Row, VirtualKey, Query>()(...args),
        ...createTableSessionSlice<Row, VirtualKey, Query>()(...args),
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
