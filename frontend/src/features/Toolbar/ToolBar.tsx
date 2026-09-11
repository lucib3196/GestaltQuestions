import clsx from "clsx";
import type { ReactNode } from "react";
import { useState } from "react";
import { GoTriangleDown } from "react-icons/go";

import type {
  ToolBarActionConfig,
  ToolBarActionHandler,
  ToolBarActionsProps,
} from "./types";

const toolbarActionsClassByVariant: Record<
  NonNullable<ToolBarActionsProps<string>["variant"]>,
  string
> = {
  inline: "flex flex-wrap items-center gap-2 w-full",
  toolbar: "flex flex-wrap items-center gap-2 refreshRows ",
};

export function toolbarButtonClass(variant: "default" | "danger" = "default") {
  const base =
    "inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45";

  if (variant === "danger") {
    return clsx(
      base,
      "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20",
    );
  }

  return clsx(
    base,
    "border-border bg-surface-secondary text-text-muted hover:border-border-strong hover:bg-surface-muted hover:text-text",
  );
}

function toolbarMenuItemClass(variant: "default" | "danger" = "default") {
  const base =
    "flex min-h-9 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45";

  if (variant === "danger") {
    return clsx(base, "text-red-300 hover:bg-red-500/10");
  }

  return clsx(base, "text-text-muted hover:bg-surface-muted hover:text-text");
}

export default function ToolBarActions<TId extends string>({
  actions,
  actionHandlers,
  roles = ["developer"],
  variant = "toolbar",
  className,
  isActionDisabled,
  renderActionPopover,
}: ToolBarActionsProps<TId>) {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  const visibleActions = actions.filter(
    (action) =>
      (action.visible ?? true) &&
      (!action.allowedRoles ||
        action.allowedRoles.some((role) => roles.includes(role))),
  );

  const primaryActions = visibleActions.filter(
    (action) => action.placement === "primary",
  );

  // If placement is not defined, default to overflow.
  const overflowActions = visibleActions.filter(
    (action) => (action.placement ?? "overflow") === "overflow",
  );

  return (
    <div
      className={clsx(toolbarActionsClassByVariant[variant] ?? "", className)}
    >
      {primaryActions.map((action) => (
        <ToolBarActionButton
          key={action.id}
          action={action}
          actionHandler={actionHandlers[action.id]}
          disabled={Boolean(action.disabled || isActionDisabled?.(action))}
          popover={renderActionPopover?.(action)}
        />
      ))}

      {overflowActions.length > 0 ? (
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOverflowOpen}
            onClick={() => setIsOverflowOpen((prev) => !prev)}
            className={toolbarButtonClass("default")}
          >
            More
            <GoTriangleDown
              className={clsx(
                "h-4 w-4 transition-transform",
                isOverflowOpen && "rotate-180",
              )}
            />
          </button>

          {isOverflowOpen ? (
            <div
              role="menu"
              className="absolute flex flex-col right-0 top-full z-50 mt-2 min-w-52 rounded-md border border-border bg-surface-strong p-1 shadow-soft"
            >
              {overflowActions.map((action) => (
                <ToolBarActionButton
                  key={action.id}
                  action={action}
                  actionHandler={async () => {
                    await actionHandlers[action.id]?.();
                    setIsOverflowOpen(false);
                  }}
                  disabled={Boolean(
                    action.disabled || isActionDisabled?.(action),
                  )}
                  popover={renderActionPopover?.(action)}
                  variant="menuitem"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolBarActionButton<TId extends string>({
  action,
  actionHandler,
  disabled,
  popover,
  variant = "button",
}: {
  action: ToolBarActionConfig<TId>;
  actionHandler: ToolBarActionHandler;
  disabled: boolean;
  popover?: ReactNode;
  variant?: "button" | "menuitem";
}) {
  const Icon = action.icon;
  const className = clsx(
    variant === "menuitem"
      ? toolbarMenuItemClass(action.variant)
      : toolbarButtonClass(action.variant),
    action.className,
  );

  return (
    <div className="relative">
      <button
        type="button"
        role={variant === "menuitem" ? "menuitem" : undefined}
        disabled={disabled}
        onClick={actionHandler}
        className={className}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        <span className="truncate">{action.label}</span>
      </button>

      {popover}
    </div>
  );
}
