import clsx from "clsx";
import type React from "react";
import { FiEye, FiFileText } from "react-icons/fi";
import { IoCodeSlash } from "react-icons/io5";

import type { QuestionEditorPane } from "../store/types";

type ActivePanesToggleProps = {
  activePanes: QuestionEditorPane[];
  availablePanes: QuestionEditorPane[];
  // eslint-disable-next-line no-unused-vars
  onTogglePane: (pane: QuestionEditorPane) => void;
};

const paneOptions: Array<{
  value: QuestionEditorPane;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "livePreview",
    label: "Preview",
    icon: <FiEye className="h-4 w-4" />,
  },
  {
    value: "editor",
    label: "Editor",
    icon: <IoCodeSlash className="h-4 w-4" />,
  },
  {
    value: "metadata",
    label: "Metadata",
    icon: <FiFileText className="h-4 w-4" />,
  },
];

export function ActivePanesToggle({
  activePanes,
  availablePanes,
  onTogglePane,
}: ActivePanesToggleProps) {
  const visiblePaneOptions = paneOptions.filter((pane) =>
    availablePanes.includes(pane.value),
  );

  if (!visiblePaneOptions.length) {
    return null;
  }

  return (
    <div className="flex min-w-fit flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase text-text-soft">
        Panes
      </span>

      <div className="flex h-9 flex-wrap items-center gap-1 rounded-md bg-surface-muted p-1">
        {visiblePaneOptions.map((pane) => {
          const active = activePanes.includes(pane.value);

          return (
            <button
              key={pane.value}
              type="button"
              aria-pressed={active}
              onClick={() => onTogglePane(pane.value)}
              className={clsx(
                "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-surface-strong text-accent shadow-sm"
                  : "text-text-muted hover:bg-surface-secondary hover:text-text",
              )}
            >
              {pane.icon}
              {pane.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
