export const STATUS_VALUES = ["archived", "draft", "published"] as const;

export type Status = (typeof STATUS_VALUES)[number];

export const STATUS_OPTIONS: {
  label: string;
  value: Status;
}[] = [
  { label: "Archived", value: "archived" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

export function isStatus(value: string): value is Status {
  return STATUS_VALUES.includes(value as Status);
}

export function normalizeStatus(value: string | null | undefined) {
  const normalized = value?.toLowerCase() ?? "";
  return isStatus(normalized) ? normalized : "draft";
}

export function getStatusLabel(status: Status) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getStatusDescription(status: Status) {
  if (status === "published") {
    return "Published items are visible to everyone.";
  }

  if (status === "archived") {
    return "Archived items are hidden from active workflows.";
  }

  return "Draft items are personal and only visible to you.";
}
