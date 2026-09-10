import clsx from "clsx";
import type React from "react";
import { FiColumns, FiMaximize2 } from "react-icons/fi";

import type { WorkspaceLayoutMode } from "../store/types";

type LayoutToggleProps = {
  value: WorkspaceLayoutMode;
  // eslint-disable-next-line no-unused-vars
  onChange: (mode: WorkspaceLayoutMode) => void;
};

const layoutOptions: Array<{
  value: WorkspaceLayoutMode;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "single",
    label: "Single",
    icon: <FiMaximize2 className="h-4 w-4" />,
  },
  {
    value: "split",
    label: "Split",
    icon: <FiColumns className="h-4 w-4" />,
  },
];

export function LayoutToggle({ value, onChange }: LayoutToggleProps) {
  return (
    <div className="flex min-w-fit items-center gap-2">
      <span className="text-xs font-semibold uppercase text-text-soft">
        Layout
      </span>

      <div className="inline-flex h-9 items-center gap-1 rounded-md bg-surface-muted p-1">
        {layoutOptions.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={clsx(
                "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-surface-strong text-accent shadow-sm"
                  : "text-text-muted hover:bg-surface-secondary hover:text-text",
              )}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
