import type { QuestionTableRowBase } from "../../../../services";

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type StatusDisplayConfig = {
  label: string;
  dotClassName: string;
  className: string;
};

const STATUS_DISPLAY_CONFIG: Record<string, StatusDisplayConfig> = {
  published: {
    label: "Published",
    dotClassName: "bg-approval",
    className: "border-approval-border bg-approval-muted text-approval",
  },
  draft: {
    label: "Draft",
    dotClassName: "bg-text-tertiary",
    className: "border-border bg-surface-muted text-text-muted",
  },
  archived: {
    label: "Archived",
    dotClassName: "bg-warning",
    className: "border-warning-border bg-warning-muted text-warning",
  },
};

export function QuestionStatusCell({ row }: { row: QuestionTableRowBase }) {
  const status = String(row.status ?? "").toLowerCase();
  const statusConfig = STATUS_DISPLAY_CONFIG[status] ?? {
    label: formatStatusLabel(status || "unknown"),
    dotClassName: "bg-text-tertiary",
    className: "border-border bg-surface-muted text-text-muted",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-base ${statusConfig.className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${statusConfig.dotClassName}`}
      />
      {statusConfig.label}
    </span>
  );
}
