import { FiUsers } from "react-icons/fi";

export function Header() {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex flex-row gap-5 items-baseline m-2 ">
        <FiUsers className="h-4 w-4" aria-hidden="true" />{" "}
        <div>
          <h1 className="text-xl font-semibold">Manage Access</h1>
          <p className="mt-1 text-sm text-text-muted">
            Review who can access this question and adjust sharing permissions.
          </p>
        </div>
      </div>
    </header>
  );
}
