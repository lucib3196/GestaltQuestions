import { useEffect, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";

type MultiSelectFilterControlProps = {
  columnKey: string;
  label: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  setFilterValue(key: string, value: unknown): void;
  clearFilterValue(key: string): void;
};

export function MultiSelectFilterControl({
  columnKey,
  label,
  options,
  selectedValues,
  setFilterValue,
  clearFilterValue,
}: MultiSelectFilterControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingValues, setPendingValues] = useState<string[]>(selectedValues);
  const selectedValuesKey = selectedValues.join("\u0000");

  useEffect(() => {
    if (!isOpen) setPendingValues(selectedValues);
  }, [isOpen, selectedValues, selectedValuesKey]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [options, search]);

  const togglePendingValue = (optionValue: string) => {
    setPendingValues((current) =>
      current.includes(optionValue)
        ? current.filter((value) => value !== optionValue)
        : [...current, optionValue],
    );
  };

  const clearValues = () => {
    setPendingValues([]);
    clearFilterValue(columnKey);
    setIsOpen(false);
  };

  const applyValues = () => {
    if (pendingValues.length > 0) setFilterValue(columnKey, pendingValues);
    else clearFilterValue(columnKey);
    setIsOpen(false);
  };

  return (
    <div className="relative mt-2">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={label}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 text-xs font-semibold normal-case tracking-normal text-text transition hover:border-accent hover:bg-surface-muted"
        onClick={() => {
          setPendingValues(selectedValues);
          setIsOpen((open) => !open);
        }}
      >
        <FaFilter aria-hidden="true" />
        <span>
          {selectedValues.length
            ? `${selectedValues.length} selected`
            : "Filter"}
        </span>
      </button>
      {isOpen ? (
        <div className="absolute left-0 z-20 mt-2 w-72 rounded-lg border border-border-strong bg-surface-strong p-4 text-left normal-case tracking-normal text-text shadow-soft">
          <input
            aria-label={`Search ${label}`}
            className="mb-3 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm font-normal text-text outline-none transition placeholder:text-text-tertiary focus:border-accent"
            placeholder="Search options..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-h-48 space-y-2 overflow-auto">
            {filteredOptions.map((option) => {
              const checked = pendingValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm font-medium text-text-muted transition hover:bg-surface-muted hover:text-text"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-accent"
                    checked={checked}
                    onChange={() => togglePendingValue(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2 border-t border-border pt-3">
            <button
              type="button"
              className="flex-1 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm font-semibold text-text transition hover:bg-surface-muted"
              onClick={clearValues}
            >
              Clear
            </button>
            <button
              type="button"
              className="flex-1 rounded-md border border-accent bg-accent px-3 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
              onClick={applyValues}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
