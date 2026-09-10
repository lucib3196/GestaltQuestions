import type { IconType } from "react-icons";
import type { UserRole } from "../../services/Auth";
import type { ReactNode } from "react";
// Base Type: Base Actions for most users is copy, download and

export type ToolBarActionVariant = "default" | "danger";

// Metadat for the toolbar component
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

// Behavior when clicked
export type ToolBarActionHandler = () => void | Promise<void>;
export type ToolBarActionHandlers<TId extends string> = Record<
  TId,
  ToolBarActionHandler
>;

// Stateful anchor of UI
export type ToolBarActionPopoverRenderer<TId extends string> = (
  action: ToolBarActionConfig<TId>,
) => ReactNode;

export type ToolBarActionsProps<TId extends string> = {
  actions: readonly ToolBarActionConfig<TId>[];
  actionHandlers: ToolBarActionHandlers<TId>;
  isActionDisabled?: (_action: ToolBarActionConfig<TId>) => boolean;
  renderActionPopover?: ToolBarActionPopoverRenderer<TId>;
  roles?: UserRole[];
  variant?: "inline" | "toolbar";
  className?: string;
};
