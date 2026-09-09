import clsx from "clsx";
import { Check, ChevronDown, Eye, Pencil, ShieldCheck } from "lucide-react";
import { type ComponentType, useEffect, useId, useRef, useState } from "react";

import type { ShareableAccessLevel } from "../../services/Access";

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
  // eslint-disable-next-line no-unused-vars
  onChange: (level: ShareableAccessLevel) => void;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
};

export function ShareLevelPicker({
  value,
  onChange,
  disabled = false,
  className,
  dropdownClassName,
}: ShareLevelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const containerRef = useRef<globalThis.HTMLDivElement | null>(null);
  const selectedOption =
    shareLevelOptions.find((option) => option.level === value) ??
    shareLevelOptions[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: globalThis.MouseEvent) {
      if (!containerRef.current?.contains(event.target as globalThis.Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    globalThis.document.addEventListener("mousedown", handlePointerDown);
    globalThis.document.addEventListener("keydown", handleKeyDown);

    return () => {
      globalThis.document.removeEventListener("mousedown", handlePointerDown);
      globalThis.document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(level: ShareableAccessLevel) {
    onChange(level);
    setIsOpen(false);
  }

  const SelectedIcon = selectedOption.icon;

  return (
    <div ref={containerRef} className={clsx("relative min-w-0", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          "flex h-10 w-full min-w-40 items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-text outline-none transition-colors",
          "hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/30",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <SelectedIcon className="h-4 w-4 shrink-0 text-text-muted" />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {selectedOption.label}
          </span>
        </span>

        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 text-text-muted transition-transform",
            isOpen ? "rotate-180" : "",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className={clsx(
            "absolute left-0 top-full z-50 mt-2 w-72 rounded-md border border-border bg-surface p-1 text-text shadow-soft",
            dropdownClassName,
          )}
        >
          {shareLevelOptions.map(
            ({ level, label, description, icon: Icon }) => {
              const isSelected = value === level;

              return (
                <button
                  key={level}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(level)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "bg-accent/15 text-text"
                      : "text-text-muted hover:bg-surface-muted hover:text-text",
                  )}
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
                    <Check
                      className="h-5 w-5 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            },
          )}
        </div>
      ) : null}
    </div>
  );
}
