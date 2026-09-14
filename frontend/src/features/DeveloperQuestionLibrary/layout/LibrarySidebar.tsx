import { FolderKanban, LibraryBig } from "lucide-react";

import type { LibraryView } from "../types";
import { LIBRARY_SIDEBAR_OPTIONS } from "../constants";

const LIBRARY_VIEW_ICONS = {
  Questions: LibraryBig,
  Collections: FolderKanban,
} satisfies Record<LibraryView, typeof LibraryBig>;

function sidebarTabClassName(isActive: boolean) {
  return [
    "group relative flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    isActive
      ? "border-accent/35 bg-accent/10 text-text shadow-sm"
      : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-surface-secondary hover:text-text",
  ].join(" ");
}

function sidebarIconClassName(isActive: boolean) {
  return [
    "flex size-9 shrink-0 items-center justify-center rounded-md border transition",
    isActive
      ? "border-accent/30 bg-accent text-bg"
      : "border-border bg-surface-secondary text-text-muted group-hover:border-accent/35 group-hover:text-accent",
  ].join(" ");
}

type LibrarySideBarProps = {
  activeView: LibraryView;
  onChange: (view: LibraryView) => void;
};

export default function LibrarySideBar({
  activeView,
  onChange,
}: LibrarySideBarProps) {
  return (
    <aside className="flex min-h-160 flex-col rounded-lg border border-border bg-surface p-3 text-text shadow-soft">
      <nav className="flex flex-col gap-1" aria-label="Question library">
        {LIBRARY_SIDEBAR_OPTIONS.map((option) => {
          const isActive = activeView === option.id;
          const Icon = LIBRARY_VIEW_ICONS[option.id];

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-current={isActive ? "page" : undefined}
              className={sidebarTabClassName(isActive)}
            >
              {isActive ? (
                <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-accent" />
              ) : null}
              <span className={sidebarIconClassName(isActive)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 truncate">{option.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
