export const accessDetailContainerStyles = {
  panel: {
    section:
      "rounded-md border border-border bg-surface-secondary text-text shadow-soft",
    header: "border-b border-border px-4 py-3",
    body: "px-4",
    row: "px-1 py-4",
    status: "px-4 py-5",
  },
  embedded: {
    section: "rounded-md border border-border bg-surface-secondary text-text",
    header: "border-b border-border px-3 py-3",
    body: "px-3",
    row: "px-0 py-3",
    status: "px-3 py-4",
  },
  compact: {
    section: "rounded-md border border-border bg-surface text-text",
    header: "border-b border-border px-3 py-2",
    body: "px-3",
    row: "px-0 py-2.5",
    status: "px-3 py-3",
  },
} as const;

export type AccessDetailVariant = keyof typeof accessDetailContainerStyles;
