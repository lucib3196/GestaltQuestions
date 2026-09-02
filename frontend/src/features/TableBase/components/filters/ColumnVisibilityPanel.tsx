import type {
  AnyTableSchema,
  TableColumn,
  TableColumnKey,
} from "../../types";
import { useTableBaseContext } from "../../state/context";
import type { TableStore } from "../../state/types";

type ColumnVisibilityPanelProps<
  Schema extends AnyTableSchema = AnyTableSchema,
> = {
  columns: TableColumn<Schema>[];
};

export function ColumnVisibilityPanel<
  Schema extends AnyTableSchema = AnyTableSchema,
>({
  columns,
}: ColumnVisibilityPanelProps<Schema>) {
  const useTypedTableContext = <Value,>(
    selector: (state: TableStore<Schema>) => Value,
  ) => useTableBaseContext<Schema, Value>(selector);

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
          const key = column.key as TableColumnKey<Schema>;
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
