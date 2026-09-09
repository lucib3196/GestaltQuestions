import clsx from "clsx";
import { Check, Eye, Pencil, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

import type { ShareableAccessLevel } from "../../../services/Access";

const shareLevelOptions = [
  {
    level: "view",
    label: "Viewer",
    description: "View and preview",
    icon: Eye,
  },
  {
    level: "edit",
    label: "Editor",
    description: "Edit content and files",
    icon: Pencil,
  },
  {
    level: "full",
    label: "Full access",
    description: "Edit, publish, and manage access",
    icon: ShieldCheck,
  },
] satisfies Array<{
  level: ShareableAccessLevel;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}>;

type ShareLevelPickerProps = {
  value: ShareableAccessLevel;
  onChange: (level: ShareableAccessLevel) => void;
  disabled?: boolean;
  className?: string;
};

export function ShareLevelPicker({
  value,
  onChange,
  disabled = false,
  className,
}: ShareLevelPickerProps) {
  return (
    <div
      className={clsx(
        "rounded-md border border-border bg-surface-secondary p-1 text-text",
        className,
      )}
    >
      {shareLevelOptions.map(({ level, label, description, icon: Icon }) => {
        const isSelected = value === level;

        return (
          <button
            key={level}
            type="button"
            disabled={disabled}
            onClick={() => onChange(level)}
            className={clsx(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-60",
              isSelected
                ? "bg-accent/15 text-text"
                : "text-text-muted hover:bg-surface-muted hover:text-text",
            )}
            aria-pressed={isSelected}
          >
            <Icon
              className={clsx(
                "h-5 w-5 shrink-0",
                isSelected ? "text-accent" : "text-text-muted",
              )}
              aria-hidden="true"
            />

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-xs text-text-muted">
                {description}
              </span>
            </span>

            {isSelected ? (
              <Check className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
