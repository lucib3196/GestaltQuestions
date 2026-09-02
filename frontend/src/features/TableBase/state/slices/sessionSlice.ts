import type { TableSessionActions, TableSessionState } from "../types";
import type { TableSliceCreator } from "./types";

export function createTableSessionSlice<
  Row,
  VirtualKey extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
>(): TableSliceCreator<
  Row,
  VirtualKey,
  Query,
  TableSessionState & TableSessionActions
> {
  return (set) => ({
    selectedIds: [],
    refreshKey: 0,
    page: 0,
    offset: 0,

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

    setPage: (page) => set({ page }),

    setOffset: (offset) => set({ offset }),
  });
}
