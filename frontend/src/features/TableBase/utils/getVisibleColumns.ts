import type { TableColumn } from "../types";

export function getVisibleColumns<
  T,
  V extends string,
  TQuery extends Record<string, unknown>,
>(
  columns: TableColumn<T, V, TQuery>[],
  visibleColumns: Partial<Record<string, boolean>>,
) {
  return columns.filter((column) => {
    const key = String(column.key);
    return visibleColumns[key] ?? column.defaultVisible ?? false;
  });
}
