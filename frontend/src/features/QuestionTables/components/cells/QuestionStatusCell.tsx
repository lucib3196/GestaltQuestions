import type { QuestionTableRowBase } from "../../../../services";

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type StatusDisplayConfig = {
  label: string;
  dotClassName: string;
  textClassName: string;
};

const STATUS_DISPLAY_CONFIG: Record<string, StatusDisplayConfig> = {
  published: {
    label: "Published",
    dotClassName: "bg-emerald-400",
    textClassName: "text-emerald-100",
  },
  draft: {
    label: "Draft",
    dotClassName: "bg-slate-500",
    textClassName: "text-slate-300",
  },
  archived: {
    label: "Archived",
    dotClassName: "bg-amber-400",
    textClassName: "text-amber-100",
  },
};

export function QuestionStatusCell({ row }: { row: QuestionTableRowBase }) {
  const status = String(row.status ?? "").toLowerCase();
  const statusConfig = STATUS_DISPLAY_CONFIG[status] ?? {
    label: formatStatusLabel(status || "unknown"),
    dotClassName: "bg-slate-500",
    textClassName: "text-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium ${statusConfig.textClassName}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${statusConfig.dotClassName}`}
      />
      {statusConfig.label}
    </span>
  );
}
