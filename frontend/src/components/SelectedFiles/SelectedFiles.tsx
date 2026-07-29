type SelectedFilesProps = {
  files: File[];
  onRemove: (index: number) => void;
  message?: string;
};

export function SelectedFiles({
  files,
  onRemove,
  message = "Selected Files",
}: SelectedFilesProps) {
  if (files.length === 0) return null;

  return (
    <div className="border-t border-border px-5 py-4">
      <div className="mb-3 text-sm font-semibold text-text">
        {message} ({files.length})
      </div>

      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-text"
          >
            <span className="max-w-44 truncate font-mono">{file.name}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="shrink-0 text-text-muted hover:text-red-300"
              aria-label={`Remove ${file.name}`}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectedFiles;
