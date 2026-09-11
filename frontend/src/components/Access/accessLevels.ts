import type { ShareableAccessLevel } from "../../services/Access";

export const editableAccessLevels = [
  "view",
  "edit",
  "full",
] as const satisfies readonly ShareableAccessLevel[];
