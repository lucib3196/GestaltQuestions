import type { IconType } from "react-icons";
import type { UserRole } from "../../services/Auth";
// Base Type: Base Actions for most users is copy, download and

export type ToolBarActionVariant = "default" | "danger";
export type ToolBarActionConfig<TId extends string = string> = {
  id: TId;
  label: string;
  icon?: IconType;
  variant?: ToolBarActionVariant;
  requiresSelection?: boolean;
  visible?: boolean;
  disabled?: boolean;
  allowedRoles?: readonly UserRole[];
};
