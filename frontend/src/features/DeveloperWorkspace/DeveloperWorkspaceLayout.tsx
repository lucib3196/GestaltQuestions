import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import DeveloperWorkspaceSidebar from "./components/DeveloperWorkspaceSidebar";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm"
    : "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text";

const workspaceLocations = [
  {
    title: "New Question",
    to: "/question_builder/questions/new",
  },
  {
    title: "Component Playground",
    to: "/question_builder/playground",
  },
  {
    title: "Chat",
    to: "/question_builder/chat",
    end: true,
  },
];

export function DeveloperWorkspaceLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="space-y-5 text-text">
      <header className="rounded-lg border border-border bg-surface px-5 py-4 shadow-soft">
        <h1 className="text-xl font-semibold">Developer Workspace</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          Build from scratch, browse your questions, edit existing ones, or
          explore component markup.
        </p>

        <nav className="mt-4 flex flex-wrap gap-2">
          {workspaceLocations.map(({ title, to, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClassName}>
              {title}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex min-h-0 flex-row gap-2">
        <DeveloperWorkspaceSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() =>
            setSidebarCollapsed((isCollapsed) => !isCollapsed)
          }
        />
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
