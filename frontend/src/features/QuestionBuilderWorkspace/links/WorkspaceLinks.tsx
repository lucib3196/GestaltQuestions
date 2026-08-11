import { NavLink, Outlet } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm"
    : "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text";

const workspaceLocations = [
  {
    title: "My Questions",
    to: "/question_builder/questions",
    end: true,
  },
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

export function WorkspaceLinks() {
  return (
    <div className="text-text">
      <header className="rounded-lg border border-border bg-surface px-5 py-4 shadow-soft">
        <h1 className="text-xl font-semibold">Question Workspace</h1>
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

      <main>
        <Outlet />
      </main>
    </div>
  );
}
