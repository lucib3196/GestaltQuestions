import type { TableColumn } from "../../types";
import { useTableBaseContext } from "../../state/context";
import type { TableColumnKey, TableStore } from "../../state/types";

type ColumnVisibilityPanelProps<
  T,
  V extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
> = {
  columns: TableColumn<T, V, Query>[];
};

export function ColumnVisibilityPanel<
  T,
  V extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
>({
  columns,
}: ColumnVisibilityPanelProps<T, V, Query>) {
  const useTypedTableContext = <Value,>(
    selector: (state: TableStore<T, V, Query>) => Value,
  ) => useTableBaseContext<T, V, Query, Value>(selector);

  const columnVisibility = useTypedTableContext((s) => s.columnVisibility);
  const setColumnVisibility = useTypedTableContext(
    (s) => s.setColumnVisibility,
  );

  return (
    <fieldset className="rounded-lg border border-slate-800 bg-slate-950 p-3 shadow-xl">
      <legend className="px-1 text-xs font-semibold uppercase text-slate-400">
        Columns
      </legend>

      <div className="flex flex-col gap-2">
        {columns.map((column) => {
          const key = column.key as TableColumnKey<T, V>;
          const keyLabel = String(column.key);
          const isVisible =
            columnVisibility[key] ?? column.defaultVisible ?? false;

          return (
            <label
              key={keyLabel}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-900"
            >
              <span>{column.label}</span>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(event) =>
                  setColumnVisibility(key, event.target.checked)
                }
                className="h-4 w-4 accent-blue-500"
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export { ColumnVisibilityPanel as QuestionTableFilterPanel };
