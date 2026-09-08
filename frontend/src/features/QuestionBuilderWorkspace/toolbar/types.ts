import type { IconType } from "react-icons";

import type { UserRole } from "../../../services/Auth";

export type ToolbarActionId =
  | "copy"
  | "download"
  | "delete"
  | "columns"
  | "collections"
  | "removeFromCollection";

export type ToolbarActionConfig = {
  id: ToolbarActionId;
  label: string;
  icon?: IconType;
  allowedRoles: UserRole[];
  requiresSelection?: boolean;
  variant?: "default" | "danger";
};
