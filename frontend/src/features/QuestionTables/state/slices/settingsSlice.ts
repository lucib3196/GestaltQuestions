import type { TableSettingsActions, TableSettingsState } from "../types";
import type { TableSliceCreator } from "./types";

export function createTableSettingsSlice<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
>(): TableSliceCreator<
  Row,
  VirtualKey,
  Query,
  TableSettingsState<Row, VirtualKey, Query> &
    TableSettingsActions<Row, VirtualKey, Query>
> {
  return (set) => ({
    search: "",
    columnDefs: [],
    columnVisibility: {},
    columnFilters: {},
    rowsPerPage: 5,

    setSearch: (search) => set({ search, page: 0, offset: 0 }),
    setColumnDefs: (columnDefs) => set({ columnDefs }),

    setColumnVisibility: (key, visible) =>
      set((state) => ({
        columnVisibility: {
          ...state.columnVisibility,
          [key]: visible,
        },
      })),

    toggleColumnVisibility: (key) =>
      set((state) => ({
        columnVisibility: {
          ...state.columnVisibility,
          [key]: !(state.columnVisibility[key] ?? true),
        },
      })),

    setColumnFilterValue: (key, value) =>
      set((state) => ({
        columnFilters: {
          ...state.columnFilters,
          [key]: value,
        },
        page: 0,
        offset: 0,
      })),

    clearColumnFilterValue: (key) =>
      set((state) => {
        const next = { ...state.columnFilters };
        delete next[key];

        return {
          columnFilters: next,
          page: 0,
          offset: 0,
        };
      }),

    clearColumnFilters: () =>
      set({
        columnFilters: {},
        page: 0,
        offset: 0,
      }),

    setRowsPerPage: (rowsPerPage) =>
      set({
        rowsPerPage,
        page: 0,
        offset: 0,
      }),
  });
}
