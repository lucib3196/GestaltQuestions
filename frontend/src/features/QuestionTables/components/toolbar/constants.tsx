import type { ToolBarActionConfig } from "./types";

export const BASE_QUESTION_TABLE_TOOLBAR_ACTIONS = [
  {
    id: "copy",
    label: "Copy",
    requiresSelection: true,
    allowedRoles: ["developer"],
    active: true,
  },
  {
    id: "download",
    label: "Download",
    requiresSelection: true,
    allowedRoles: ["developer"],
    active: true,
  },
  {
    id: "tableFilters",
    label: "Filters",
    allowedRoles: ["developer"],
    active: true,
  },
] as const satisfies readonly ToolBarActionConfig[];

export type BaseQuestionTableToolbarActionId =
  (typeof BASE_QUESTION_TABLE_TOOLBAR_ACTIONS)[number]["id"];
