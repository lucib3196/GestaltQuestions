import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { FaFilter } from "react-icons/fa";

import { useVisibleRowSelection } from "../../state/selection";
import type { AnyTableSchema, RowId, TableColumn, TableRow } from "../../types";
import { ColumnFilterControl } from "../filters";

type TableBaseHeaderProps<Schema extends AnyTableSchema = AnyTableSchema> =
  ComponentPropsWithoutRef<"thead"> & {
    columns: TableColumn<Schema>[];
    rows: TableRow<Schema>[];
    getRowId: (_row: TableRow<Schema>) => RowId;
  };

export default function TableBaseHeader<
  Schema extends AnyTableSchema = AnyTableSchema,
>({
  columns,
  rows,
  getRowId,
  className,
  ...props
}: TableBaseHeaderProps<Schema>) {
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const selection = useVisibleRowSelection(rows, getRowId);

  return (
    <thead className={className} {...props}>
      <tr className="bg-surface-strong/95">
        {columns.map((column) => {
          const columnKey = String(column.key);
          const isFilterOpen = openFilterKey === columnKey;
          const shouldShowFilter = column.filter?.show ?? true;
          const hasVisibleFilter = Boolean(column.filter && shouldShowFilter);
          const label = column.label ?? columnKey;

          return (
            <th
              key={columnKey}
              className="min-w-44 border-b border-border-strong px-4 py-3 text-left align-top text-xs font-semibold uppercase tracking-wide text-text-muted"
            >
              <div className="flex min-h-6 items-center gap-2">
                {hasVisibleFilter ? (
                  <button
                    type="button"
                    aria-label={`${isFilterOpen ? "Hide" : "Show"} filter for ${
                      column.label ?? columnKey
                    }`}
                    aria-expanded={isFilterOpen}
                    className={
                      isFilterOpen
                        ? "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-bg shadow-sm transition hover:opacity-90"
                        : "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition hover:border-accent hover:bg-surface-muted hover:text-accent"
                    }
                    onClick={() =>
                      setOpenFilterKey((currentKey) =>
                        currentKey === columnKey ? null : columnKey,
                      )
                    }
                  >
                    <FaFilter aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {column.headerRender ? (
                  column.headerRender({
                    label,
                    columnKey,
                    ...selection,
                  })
                ) : (
                  <span className="min-w-0 truncate">{label}</span>
                )}
              </div>
              {isFilterOpen && hasVisibleFilter ? (
                <div className="min-w-52 max-w-72">
                  <ColumnFilterControl column={column} />
                </div>
              ) : null}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
