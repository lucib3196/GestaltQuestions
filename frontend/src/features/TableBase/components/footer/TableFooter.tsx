import { useEffect, useState } from "react";

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 25, 50];

type TableFooterProps = {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function TableFooter({
  from,
  to,
  total,
  page,
  totalPages,
  rowsPerPage,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  onRowsPerPageChange,
  onPreviousPage,
  onNextPage,
}: TableFooterProps) {
  const [customRowsPerPage, setCustomRowsPerPage] = useState(
    String(rowsPerPage),
  );
  const normalizedOptions = Array.from(
    new Set(
      [...rowsPerPageOptions, rowsPerPage]
        .filter((option) => Number.isFinite(option) && option > 0)
        .map((option) => Math.floor(option)),
    ),
  ).sort((left, right) => left - right);

  useEffect(() => {
    setCustomRowsPerPage(String(rowsPerPage));
  }, [rowsPerPage]);

  const commitRowsPerPage = (value: string) => {
    const nextRowsPerPage = Number.parseInt(value, 10);

    if (!Number.isFinite(nextRowsPerPage) || nextRowsPerPage < 1) {
      return;
    }

    onRowsPerPageChange(nextRowsPerPage);
  };

  const handleRowsPerPageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextValue = event.target.value;

    setCustomRowsPerPage(nextValue);
    commitRowsPerPage(nextValue);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
      <div>
        {from}-{to} of {total}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="rowsPerPage">Rows:</label>
        <select
          id="rowsPerPage"
          className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-text outline-none focus:border-accent"
          value={rowsPerPage}
          onChange={(event) =>
            onRowsPerPageChange(Number.parseInt(event.target.value, 10))
          }
        >
          {normalizedOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="customRowsPerPage" className="sr-only">
          Custom rows per page
        </label>
        <input
          id="customRowsPerPage"
          type="number"
          min={1}
          value={customRowsPerPage}
          onChange={handleRowsPerPageInputChange}
          onBlur={() => {
            if (!customRowsPerPage.trim()) {
              setCustomRowsPerPage(String(rowsPerPage));
              return;
            }

            commitRowsPerPage(customRowsPerPage);
          }}
          className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm text-text outline-none focus:border-accent"
        />

        <button
          type="button"
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onPreviousPage}
          disabled={page === 0}
        >
          Previous
        </button>

        <span>
          {page + 1} / {totalPages}
        </span>

        <button
          type="button"
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onNextPage}
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
