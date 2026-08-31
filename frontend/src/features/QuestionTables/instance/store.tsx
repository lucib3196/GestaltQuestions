import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestionTableColumn } from "../config/columns";

// Handle the state of the table
type TableFilterValues = Record<string, unknown>;
type TableColumnVisibility = Record<string, boolean>;

export type QuestionTableState = {
  selectedIDs: string[];
  refreshKey: number;
  visibleColumns: TableColumnVisibility;
  columns: QuestionTableColumn[];
  filters: TableFilterValues;
  search: string;
  limit: number;
  offset: number;

  // UI Table Settings
  page: number;
  rowsPerPage: number;
};

export type QuestionTableBaseActions = {
  setQuestionTableColumns: (col: QuestionTableColumn[]) => void;
  setSelectedIDs: (ids: string[]) => void;
  refreshQuestions: () => void;
  toggleSelectedId: (id: string) => void;
  clearSelectedIds: () => void;

  setColumnVisible: (key: string, visible: boolean) => void;
  toggleColumnVisible: (key: string) => void;

  setFilterValue: (key: string, value: unknown) => void;
  clearFilterValue: (key: string) => void;
  clearFilters: () => void;
  setSearch: (value: string) => void;
  setPagination: (next: { rowsPerPage?: number; offset?: number }) => void;
  setPage: (page: number) => void;
};

export type QuestionTableStore = QuestionTableState & QuestionTableBaseActions;

const initialState: QuestionTableState = {
  selectedIDs: [],
  refreshKey: 0,
  visibleColumns: {},
  columns: [],
  filters: {},
  search: "",

  limit: 200,
  offset: 0,
  page: 0,
  rowsPerPage: 5,
};

export function createQuestionTableStore(
  preloaded?: Partial<QuestionTableState>,
) {
  return createStore<QuestionTableStore>()(
    persist(
      (set) => ({
        ...initialState,
        ...preloaded,
        setQuestionTableColumns: (col) => set({ columns: col }),
        refreshQuestions: () =>
          set((state) => ({ refreshKey: state.refreshKey + 1 })),
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
            rowsPerPage: next.rowsPerPage ?? state.rowsPerPage,
            offset: next.offset ?? state.offset,
          })),
        setPage: (page) => set({ page: page }),
      }),
      {
        name: "question-table-settings",
        partialize: (state) => ({
          rowsPerPage: state.rowsPerPage,
          filters: state.filters,
        }),
      },
    ),
  );
}
