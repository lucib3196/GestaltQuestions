import { FaCopy, FaDownload, FaFilter, FaTimesCircle } from "react-icons/fa";

import type { ToolBarActionConfig } from "../../../Toolbar/types";

export const publishedQuestionsToolbarActions = [
  {
    id: "copy",
    label: "Copy",
    icon: FaCopy,
    requiresSelection: true,
    placement: "primary",
    allowedRoles: ["developer"],
    visible: true,
  },
  {
    id: "download",
    label: "Download",
    icon: FaDownload,
    requiresSelection: true,
    placement: "primary",
    allowedRoles: ["developer"],
    visible: true,
  },
  {
    id: "tableFilters",
    label: "Filters",
    icon: FaFilter,
    placement: "primary",
    allowedRoles: ["developer"],
    visible: true,
    className: "ml-auto",
  },
  {
    id: "clearFilters",
    label: "Clear filters",
    icon: FaTimesCircle,
    placement: "primary",
    allowedRoles: ["developer"],
    visible: true,
  },
] as const satisfies readonly ToolBarActionConfig[];

export type PublishedQuestionsToolbarActionId =
  (typeof publishedQuestionsToolbarActions)[number]["id"];
