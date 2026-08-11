import { createStore } from "zustand";

import type { QuestionTableColumn } from "../config/columns";

// Handle the state of the table
type TableFilterValues = Record<string, unknown>;
type TableColumnVisibility = Record<string, boolean>;

export type QuestionTableState = {
  selectedIDs: string[];
  visibleColumns: TableColumnVisibility;
  columns: QuestionTableColumn[];
  filters: TableFilterValues;
  search: string;
  limit: number;
  offset: number;
};

export type QuestionTableBaseActions = {
  setQuestionTableColumns: (col: QuestionTableColumn[]) => void;
  setSelectedIDs: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelectedIds: () => void;

  setColumnVisible: (key: string, visible: boolean) => void;
  toggleColumnVisible: (key: string) => void;

  setFilterValue: (key: string, value: unknown) => void;
  clearFilterValue: (key: string) => void;
  clearFilters: () => void;
  setSearch: (value: string) => void;
  setPagination: (next: { limit?: number; offset?: number }) => void;
};

export type QuestionTableStore = QuestionTableState & QuestionTableBaseActions;

export function createQuestionTableStore(
  initial?: Partial<QuestionTableState>,
) {
  return createStore<QuestionTableStore>((set) => ({
    selectedIDs: [],
    visibleColumns: {},
    columns: [],
    filters: {},
    search: "",
    limit: 50,
    offset: 0,
    ...initial,
    setQuestionTableColumns: (col) => set({ columns: col }),
    setSelectedIDs: (selectedIds) => set({ selectedIDs: selectedIds }),
    toggleSelectedId: (id) =>
      set((state) => ({
        selectedIDs: state.selectedIDs.includes(id)
          ? state.selectedIDs.filter((value) => value !== id)
          : [...state.selectedIDs, id],
      })),
    clearSelectedIds: () => set({ selectedIDs: [] }),
    setColumnVisible: (key, visible) =>
      set((state) => ({
        visibleColumns: {
          ...state.visibleColumns,
          [key]: visible,
        },
      })),
    toggleColumnVisible: (key) =>
      set((state) => ({
        visibleColumns: {
          ...state.visibleColumns,
          [key]: !(state.visibleColumns[key] ?? true),
        },
      })),
    setFilterValue: (key, value) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
        offset: 0,
      })),
    clearFilterValue: (key) =>
      set((state) => {
        const next = { ...state.filters };
        delete next[key];
        return { filters: next, offset: 0 };
      }),
    clearFilters: () => set({ filters: {}, offset: 0 }),
    setSearch: (search) => set({ search, offset: 0 }),
    setPagination: (next) =>
      set((state) => ({
        limit: next.limit ?? state.limit,
        offset: next.offset ?? state.offset,
      })),
  }));
}
