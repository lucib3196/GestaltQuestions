import type {
  TableSettingsState,
  TableSettingsActions,
  TableSessionState,
  TableSessionActions,
  TableStore,
} from "./types";
import { persist } from "zustand/middleware";
import { createStore, type StateCreator } from "zustand";

type TableSliceCreator<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
  Slice = unknown,
> = StateCreator<TableStore<Row, VirtualKey, Query>, [], [], Slice>;

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
    page: 0,
    offset: 0,

    setSearch: (search: string) => set({ search: search }),
    setColumnDefs: (columnsDef) => ({ columnsDef: columnsDef }),
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

export function createTableSessionSlice<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
>(): TableSliceCreator<
  Row,
  VirtualKey,
  Query,
  TableSessionState & TableSessionActions
> {
  return (set) => ({
    selectedIds: [],
    refreshKey: 0,

    setSelectedIds: (selectedIds) => set({ selectedIds }),
    toggleSelectedId: (id) =>
      set((state) => ({
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((value) => value !== id)
          : [...state.selectedIds, id],
      })),
    clearSelectedIds: () => set({ selectedIds: [] }),
    refreshRows: () =>
      set((state) => ({
        refreshKey: state.refreshKey + 1,
      })),
  });
}

export function createTableStore<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
>(preloaded?: Partial<TableStore<Row, VirtualKey, Query>>) {
  return createStore<TableStore<Row, VirtualKey, Query>>()(
    persist(
      (...args) => ({
        ...createTableSettingsSlice<Row, VirtualKey, Query>()(...args),
        ...createTableSessionSlice<Row, VirtualKey, Query>()(...args),
        ...preloaded,
      }),
      {
        name: "table-settings",
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
