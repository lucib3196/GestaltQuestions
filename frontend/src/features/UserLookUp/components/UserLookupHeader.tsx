type UserLookupHeaderProps = {
  selectedCount: number;
  onClear: () => void;
};

export function UserLookupHeader({
  selectedCount,
  onClear,
}: UserLookupHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">Invite developers</h2>
        <p className="text-xs text-text-muted">
          Search and select people to share with.
        </p>
      </div>

      {selectedCount > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-muted hover:text-text"
        >
          Clear {selectedCount}
        </button>
      ) : null}
    </div>
  );
}
