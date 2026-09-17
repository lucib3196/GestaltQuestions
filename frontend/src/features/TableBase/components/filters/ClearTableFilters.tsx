import { FaFilter } from "react-icons/fa";

import { useTableBaseContext } from "../../state/context";

export function ClearTableFilters() {
  const clearFilters = useTableBaseContext((s) => s.clearColumnFilters);
  const filters = useTableBaseContext((s) => s.columnFilters);
  const disabled = Object.keys(filters).length === 0;
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted">
        <FaFilter className="h-3.5 w-3.5" />
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={clearFilters}
        className="text-sm font-semibold text-accent transition hover:text-accent-strong disabled:cursor-not-allowed disabled:text-text-tertiary"
      >
        Clear all filters
      </button>
    </div>
  );
}
