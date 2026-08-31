import type { TableColumn } from "../../../../components/Table";
import { useQuestionTableContext } from "../../state/context";
import { MultiSelectFilterControl } from "./MultiSelectFilterControl";

type ColumnFilterControlProps<T, V extends string = never> = {
  column: TableColumn<T, V>;
};

export function ColumnFilterControl<T, V extends string = never>({
  column,
}: ColumnFilterControlProps<T, V>) {
  const filter = column.filter;
  const columnKey = String(column.key);
  const value = useQuestionTableContext((state) => state.filters[columnKey]);
  const setFilterValue = useQuestionTableContext(
    (state) => state.setFilterValue,
  );
  const clearFilterValue = useQuestionTableContext(
    (state) => state.clearFilterValue,
  );

  if (!filter) return null;

  const label = filter.label ?? `Filter ${column.label ?? columnKey}`;
  const inputClassName =
    "mt-2 h-9 w-full rounded-md border border-border bg-surface-secondary px-2.5 text-xs font-medium normal-case tracking-normal text-text outline-none transition hover:border-border-strong focus:border-accent focus:bg-surface";

  switch (filter.kind) {
    case "select":
      return (
        <select
          aria-label={label}
          className={inputClassName}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue) setFilterValue(columnKey, nextValue);
            else clearFilterValue(columnKey);
          }}
        >
          <option value="">All</option>
          {filter.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "multiSelect": {
      const selectedValues = Array.isArray(value) ? value.map(String) : [];

      return (
        <MultiSelectFilterControl
          columnKey={columnKey}
          label={label}
          options={filter.options ?? []}
          selectedValues={selectedValues}
          setFilterValue={setFilterValue}
          clearFilterValue={clearFilterValue}
        />
      );
    }
    case "text":
      return (
        <input
          aria-label={label}
          className={inputClassName}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue) setFilterValue(columnKey, nextValue);
            else clearFilterValue(columnKey);
          }}
        />
      );
    case "booleanToggle": {
      const selectedValue = typeof value === "boolean" ? value : null;
      const options = [
        { label: "Adaptive", value: true },
        { label: "Static", value: false },
      ];

      return (
        <div className="mt-2 inline-flex rounded-md border border-border bg-surface-secondary p-1 normal-case tracking-normal">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;

            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? "rounded bg-accent px-2.5 py-1.5 text-xs font-semibold text-bg"
                    : "rounded px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-surface-muted hover:text-text"
                }
                onClick={() => {
                  if (isSelected) clearFilterValue(columnKey);
                  else setFilterValue(columnKey, option.value);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }
    case "dateRange": {
      const range =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as { from?: string; to?: string })
          : {};

      const updateRange = (nextRange: { from?: string; to?: string }) => {
        if (nextRange.from || nextRange.to)
          setFilterValue(columnKey, nextRange);
        else clearFilterValue(columnKey);
      };

      return (
        <div className="mt-2 flex gap-2">
          <input
            aria-label={`${label} from`}
            className={inputClassName}
            type="date"
            value={range.from ?? ""}
            onChange={(event) =>
              updateRange({ ...range, from: event.target.value || undefined })
            }
          />
          <input
            aria-label={`${label} to`}
            className={inputClassName}
            type="date"
            value={range.to ?? ""}
            onChange={(event) =>
              updateRange({ ...range, to: event.target.value || undefined })
            }
          />
        </div>
      );
    }
  }
}
