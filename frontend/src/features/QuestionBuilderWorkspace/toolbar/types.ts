
import type { UserRole } from "../../Auth";
import type { IconType } from "react-icons";

export type ToolbarActionId =
  | "copy"
  | "download"
  | "delete"
  | "columns"
  | "collections";

export type ToolbarActionConfig = {
  id: ToolbarActionId;
  label: string;
  icon?: IconType;
  allowedRoles: UserRole[];
  requiresSelection?: boolean;
  variant?: "default" | "danger";
};

