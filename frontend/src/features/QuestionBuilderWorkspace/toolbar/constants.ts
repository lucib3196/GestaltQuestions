import type { IconType } from "react-icons";
import { BsCollectionFill } from "react-icons/bs";
import { FaCopy, FaDownload, FaFilter } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import {
  BASE_QUESTION_TABLE_TOOLBAR_ACTIONS,
  type BaseQuestionTableToolbarActionId,
} from "../../QuestionTables/components/toolbar/constants";
import type { ToolBarActionConfig } from "../../QuestionTables/components/toolbar/types";

const BASE_WORKSPACE_TOOLBAR_ACTION_ICONS: Record<
  BaseQuestionTableToolbarActionId,
  IconType
> = {
  copy: FaCopy,
  download: FaDownload,
  tableFilters: FaFilter,
};

const WORKSPACE_BASE_TOOLBAR_ACTIONS = BASE_QUESTION_TABLE_TOOLBAR_ACTIONS.map(
  (action) => ({
    ...action,
    icon: BASE_WORKSPACE_TOOLBAR_ACTION_ICONS[action.id],
  }),
) satisfies readonly ToolBarActionConfig<BaseQuestionTableToolbarActionId>[];

type WorkspaceToolbarExtraActionId = "delete" | "collections";

export type WorkspaceToolbarActionId =
  | BaseQuestionTableToolbarActionId
  | WorkspaceToolbarExtraActionId;

export const WORKSPACE_TOOLBAR_ACTIONS = [
  ...WORKSPACE_BASE_TOOLBAR_ACTIONS,
  {
    id: "delete",
    label: "Delete",
    icon: MdDelete,
    variant: "danger",
    requiresSelection: true,
    allowedRoles: ["developer"],
    active: false,
  },
  {
    id: "collections",
    label: "Collections",
    icon: BsCollectionFill,
    allowedRoles: ["developer"],
    active: true,
  },
] as const satisfies readonly ToolBarActionConfig<WorkspaceToolbarActionId>[];

export type WorkspaceToolbarPopupActionId = Extract<
  WorkspaceToolbarActionId,
  "tableFilters" | "collections"
>;
