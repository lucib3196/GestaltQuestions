import { BsCollectionFill } from "react-icons/bs";
import { FaCopy, FaDownload, FaFilter, FaTimesCircle } from "react-icons/fa";
import { MdDelete, MdRemoveCircle } from "react-icons/md";

import type { ToolBarActionConfig } from "../../Toolbar/types";

export const QUESTION_LIBRARY_TOOLBAR_ACTION_CONFIGS = {
  copy: {
    id: "copy",
    label: "Copy",
    icon: FaCopy,
    requiresSelection: true,
    allowedRoles: ["developer"],
    visible: true,
  },
  shareQuestion: {
    id: "shareQuestion",
    label: "Share Question",
    requiresSelection: true,
    placement: "primary",
    allowedRoles: ["developer"],
    visible: true,
  },
  download: {
    id: "download",
    label: "Download",
    icon: FaDownload,
    requiresSelection: true,
    allowedRoles: ["developer"],
    visible: true,
  },
  tableFilters: {
    id: "tableFilters",
    label: "Filters",
    icon: FaFilter,
    allowedRoles: ["developer"],
    visible: true,
    className: "ml-auto",
  },
  clearFilters: {
    id: "clearFilters",
    label: "Clear filters",
    icon: FaTimesCircle,
    allowedRoles: ["developer"],
    visible: true,
  },
  delete: {
    id: "delete",
    label: "Delete",
    icon: MdDelete,
    variant: "danger",
    requiresSelection: true,
    allowedRoles: ["developer"],
    visible: true,
  },
  collections: {
    id: "collections",
    label: "Add to Collections",
    icon: BsCollectionFill,
    allowedRoles: ["developer"],
    visible: true,
  },
  removeFromCollection: {
    id: "removeFromCollection",
    label: "Remove from Collection",
    icon: MdRemoveCircle,
    variant: "danger",
    requiresSelection: true,
    allowedRoles: ["developer"],
    visible: true,
  },
} as const satisfies Record<string, ToolBarActionConfig>;

export type QuestionLibraryToolbarActionId =
  keyof typeof QUESTION_LIBRARY_TOOLBAR_ACTION_CONFIGS;

type QuestionLibraryToolbarActionOverride<
  TId extends QuestionLibraryToolbarActionId,
> = Partial<Omit<ToolBarActionConfig<TId>, "id">>;

export function buildQuestionLibraryToolbarActions<
  TId extends QuestionLibraryToolbarActionId,
>(
  ids: readonly TId[],
  overrides: Partial<
    Record<TId, QuestionLibraryToolbarActionOverride<TId>>
  > = {},
) {
  return ids.map((id) => ({
    ...QUESTION_LIBRARY_TOOLBAR_ACTION_CONFIGS[id],
    ...overrides[id],
  })) as unknown as ToolBarActionConfig<TId>[];
}

export const QUESTION_LIBRARY_TOOLBAR_ACTIONS =
  buildQuestionLibraryToolbarActions([
    "copy",
    "download",
    "tableFilters",
    "delete",
    "collections",
    "removeFromCollection",
  ] as const);

export type QuestionLibraryToolbarPopupActionId = Extract<
  QuestionLibraryToolbarActionId,
  "tableFilters" | "collections"
>;
