import type { AnyTableSchema, RowId, TableColumn, TableRow } from "../types";

type TableBodyProps<Schema extends AnyTableSchema = AnyTableSchema> =
  React.ComponentPropsWithRef<"tbody"> & {
    rows: TableRow<Schema>[];
    columns: TableColumn<Schema>[];
    getRowId: (row: TableRow<Schema>) => RowId;
    selectedIds: string[];
    setSelectedIds: (val: string[]) => void;
    onRowSelect?: (rowId: RowId) => void;
  };

export function TableBody<Schema extends AnyTableSchema = AnyTableSchema>({
  rows,
  columns,
  getRowId,
  className,
  selectedIds,
  setSelectedIds,
  onRowSelect,
  ...props
}: TableBodyProps<Schema>) {
  return (
    <tbody className={className} {...props}>
      {rows.length === 0 && (
        <tr>
          <td
            className="px-4 py-8 text-center text-sm text-text-muted"
            colSpan={columns.length}
          >
            No questions found.
          </td>
        </tr>
      )}

      {rows.map((row) => {
        const rowKey = getRowId(row);

        return (
          <tr
            key={rowKey}
            className="border-b border-border/70 last:border-b-0 hover:bg-surface-muted/60"
          >
            {columns.map((column) => {
              const columnKey = String(column.key);

              if (columnKey === "title") {
                return (
                  <td
                    key={`${rowKey}-${columnKey}`}
                    className="px-4 py-3 text-sm text-text"
                  >
                    {column.render
                      ? column.render(row, () => onRowSelect?.(rowKey))
                      : null}
                  </td>
                );
              }
              if (columnKey === "select") {
                const onSelect = () => {
                  const nextSelectedIds = selectedIds.includes(rowKey)
                    ? selectedIds.filter((id) => id !== rowKey)
                    : [...selectedIds, rowKey];

                  setSelectedIds(nextSelectedIds);
                };
                const isChecked = selectedIds.includes(rowKey);
                return (
                  <td
                    key={`${rowKey}-${columnKey}`}
                    className="px-4 py-3 text-sm text-text"
                  >
                    {column.render
                      ? column.render(row, onSelect, isChecked)
                      : null}
                  </td>
                );
              }
              return (
                <td
                  key={`${rowKey}-${columnKey}`}
                  className="px-4 py-3 text-sm text-text"
                >
                  {column.render ? column.render(row) : null}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
