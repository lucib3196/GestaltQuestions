import type { ToolBarActionConfig } from "./types";
import type { UserRole } from "../../../Auth";

export type ToolBarActionsProps<TId extends string> = {
  actions: readonly ToolBarActionConfig<TId>[];
  actionHandlers: Record<TId, () => void>;
  roles?: UserRole[];
  isActionDisabled?: (action: ToolBarActionConfig<TId>) => boolean;
  variant?: "inline" | "toolbar";
};

const toolbarActionsClassByVariant: Record<
  NonNullable<ToolBarActionsProps<string>["variant"]>,
  string
> = {
  inline: "flex flex-wrap items-center gap-2",
  toolbar: "flex flex-wrap items-center gap-2 md:ml-auto",
};

export function toolbarButtonClass(variant: "default" | "danger" = "default") {
  const base =
    "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45";

  if (variant === "danger") {
    return `${base} border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20`;
  }

  return `${base} border-border bg-surface-secondary text-text-muted hover:border-border-strong hover:bg-surface-muted hover:text-text`;
}

export default function ToolBarActions<TId extends string>({
  actions,
  actionHandlers,
  roles = ["developer"],
  isActionDisabled,
  variant = "toolbar",
}: ToolBarActionsProps<TId>) {
  const visibleActions = actions.filter(
    (action) =>
      action.active &&
      (!action.allowedRoles ||
        action.allowedRoles.some((role) => roles.includes(role))),
  );

  return (
    <div className={toolbarActionsClassByVariant[variant]}>
      {visibleActions.map((action) => {
        const Icon = action.icon;
        const disabled = isActionDisabled?.(action) ?? false;

        return (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={actionHandlers[action.id]}
            className={toolbarButtonClass(action.variant)}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
