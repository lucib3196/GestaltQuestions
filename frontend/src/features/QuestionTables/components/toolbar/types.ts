import type { IconType } from "react-icons";
import type { UserRole } from "../../../Auth";
// Base Type: Base Actions for most users is copy, download and
export type ToolBarActionBaseId = "copy" | "download" | "tableFilters";

export type ToolBarActionConfig<TId extends string = string> = {
  id: TId; // Id of the action
  label: string; // Label for displaying
  icon?: IconType; // Optional Icon
  variant?: "default" | "danger"; // Default styles
  requiresSelection?: boolean;
  active: boolean; // Wether to show. Meant for hiding features as needed
  allowedRoles?: UserRole[]; // Optional for hiding specific actions based on user roles
};

