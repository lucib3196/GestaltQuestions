import { FolderKanban, LibraryBig } from "lucide-react";
import { NavLink } from "react-router-dom";
import { GoSidebarCollapse } from "react-icons/go";
import { GoSidebarExpand } from "react-icons/go";
import { DEVELOPER_WORKSPACE_SIDEBAR_OPTIONS } from "../constants";
import type { DeveloperWorkspaceSection } from "../types";

const WORKSPACE_SECTION_ICONS = {
  questions: LibraryBig,
  collections: FolderKanban,
} satisfies Record<DeveloperWorkspaceSection, typeof LibraryBig>;

function sidebarTabClassName(isActive: boolean, collapsed: boolean) {
  return [
    "group relative flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold transition",
    collapsed ? "justify-center" : "",
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

type DeveloperWorkspaceSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function DeveloperWorkspaceSidebar({
  collapsed,
  onToggleCollapsed,
}: DeveloperWorkspaceSidebarProps) {
  return (
    <aside
      className={[
        "flex min-h-160 shrink-0 flex-col rounded-lg border border-border bg-surface p-3 text-text shadow-soft transition-[width]",
        collapsed ? "w-18" : "w-80",
      ].join(" ")}
    >
      <nav className="flex flex-col gap-1" aria-label="Developer workspace">
        <div
          className={[
            "mb-2 flex items-center gap-2",
            collapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!collapsed ? (
            <h1 className="min-w-0 truncate text-sm font-semibold text-text-muted">
              Developer Workspace
            </h1>
          ) : null}

          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {collapsed ? (
              <GoSidebarExpand className="size-4" aria-hidden="true" />
            ) : (
              <GoSidebarCollapse className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {DEVELOPER_WORKSPACE_SIDEBAR_OPTIONS.map((option) => {
          const Icon = WORKSPACE_SECTION_ICONS[option.id];

          return (
            <NavLink
              key={option.id}
              to={option.to}
              end={option.end}
              title={collapsed ? option.label : undefined}
              className={({ isActive }) =>
                sidebarTabClassName(isActive, collapsed)
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-accent" />
                  ) : null}
                  <span className={sidebarIconClassName(isActive)}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {!collapsed ? (
                    <span className="min-w-0 truncate">{option.label}</span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
