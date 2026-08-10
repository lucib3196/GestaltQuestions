import { BsCollectionFill } from "react-icons/bs";
import { FaCopy, FaDownload, FaFilter } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import type { ToolbarActionConfig } from "./types";
export const QUESTION_TABLE_TOOLBAR_ACTIONS: ToolbarActionConfig[] = [
  {
    id: "copy",
    label: "Copy",
    icon: FaCopy,
    allowedRoles: ["admin", "developer", "teacher"],
    requiresSelection: true,
  },
  {
    id: "download",
    label: "Download",
    icon: FaDownload,
    allowedRoles: ["admin", "developer", "teacher"],
    requiresSelection: true,
  },
  {
    id: "delete",
    label: "Delete",
    icon: MdDelete,
    allowedRoles: ["developer"],
    requiresSelection: true,
    variant: "danger",
  },
  {
    id: "columns",
    label: "Columns",
    icon: FaFilter,
    allowedRoles: ["admin", "developer", "teacher", "student"],
  },
  {
    id: "collections",
    label: "Collections",
    icon: BsCollectionFill,
    allowedRoles: ["developer"],
  },
];
