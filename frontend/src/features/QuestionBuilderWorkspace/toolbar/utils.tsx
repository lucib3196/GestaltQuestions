export function toolbarButtonClass(variant: "default" | "danger" = "default") {
  const base =
    "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45";

  if (variant === "danger") {
    return `${base} border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20`;
  }

  return `${base} border-border bg-surface-secondary text-text-muted hover:border-border-strong hover:bg-surface-muted hover:text-text`;
}
