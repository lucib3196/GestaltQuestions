import type { AnyTableSchema, TableColumn } from "../types";

export function getVisibleColumns<
  Schema extends AnyTableSchema = AnyTableSchema,
>(
  columns: TableColumn<Schema>[],
  visibleColumns: Partial<Record<string, boolean>>,
) {
  return columns.filter((column) => {
    const key = String(column.key);
    return visibleColumns[key] ?? column.defaultVisible ?? false;
  });
}
