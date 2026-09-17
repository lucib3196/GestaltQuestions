type UserLookupPaginationProps = {
  show: boolean;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function UserLookupPagination({
  show,
  page,
  totalPages,
  onPrevious,
  onNext,
}: UserLookupPaginationProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-text-muted">
      <button
        type="button"
        disabled={page === 1}
        onClick={onPrevious}
        className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page === totalPages}
        onClick={onNext}
        className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
