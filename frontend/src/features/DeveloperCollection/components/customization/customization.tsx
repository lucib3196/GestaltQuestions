import {
  Atom,
  Binary,
  BookOpen,
  Braces,
  Calculator,
  CircuitBoard,
  Code2,
  Cpu,
  Database,
  FlaskConical,
  Folder,
  type LucideIcon,
  Network,
} from "lucide-react";

export const COLLECTION_COLOR_PRESETS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#db2777",
  "#64748b",
] as const;

export const COLLECTION_ICON_OPTIONS = [
  { key: "folder", label: "General", icon: Folder },
  { key: "code", label: "Programming", icon: Code2 },
  { key: "braces", label: "Algorithms", icon: Braces },
  { key: "database", label: "Data", icon: Database },
  { key: "cpu", label: "Systems", icon: Cpu },
  { key: "circuit", label: "Circuits", icon: CircuitBoard },
  { key: "network", label: "Networks", icon: Network },
  { key: "atom", label: "Physics", icon: Atom },
  { key: "flask", label: "Lab", icon: FlaskConical },
  { key: "calculator", label: "Math", icon: Calculator },
  { key: "binary", label: "Theory", icon: Binary },
  { key: "book", label: "Reference", icon: BookOpen },
] as const;

export type CollectionIconKey = (typeof COLLECTION_ICON_OPTIONS)[number]["key"];

const COLLECTION_ICON_MAP = COLLECTION_ICON_OPTIONS.reduce(
  (icons, option) => {
    icons[option.key] = option.icon;
    return icons;
  },
  {} as Record<CollectionIconKey, LucideIcon>,
);

export const DEFAULT_COLLECTION_CUSTOMIZATION = {
  schema_version: 1,
  color: "#7c3aed",
  icon: "folder",
} as const;

export function isCollectionIconKey(
  value: string | null | undefined,
): value is CollectionIconKey {
  return Boolean(value && value in COLLECTION_ICON_MAP);
}

export function getCollectionIcon(value: string | null | undefined) {
  return isCollectionIconKey(value) ? COLLECTION_ICON_MAP[value] : Folder;
}

export function getCollectionColor(value: string | null | undefined) {
  return value || DEFAULT_COLLECTION_CUSTOMIZATION.color;
}
