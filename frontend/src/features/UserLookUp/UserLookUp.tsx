import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useMemo, useState } from "react";

import { SearchBar } from "../../components/SearchBar";
import type { UserDetailRead } from "../../services";
import { UserLookupResult } from "./components";
import { useUserLookup } from "./hooks/useUserLookUp";
import { useUserLookupStore } from "./instance/context";

const USERS_PER_PAGE = 3;

export function UserLookUp() {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 250);
  const selectedUsersById = useUserLookupStore((s) => s.selectedUsersById);
  const toggleSelectedUser = useUserLookupStore((s) => s.toggleSelectedUser);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);
  const selectedUserIds = Object.keys(selectedUsersById);

  const handleSelect = (user: UserDetailRead) => {
    toggleSelectedUser(user);
  };

  const { users, loading, error } = useUserLookup(debouncedSearch);
  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const visibleUsers = useMemo(() => {
    const start = (page - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [page, users]);

  return (
    <div className="w-full max-w-xl rounded-md border border-border bg-surface p-4 text-text">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">User Lookup</h2>
        <p className="text-xs text-text-muted">
          Search developers to share questions or collections.
        </p>
      </div>

      <SearchBar
        value={search}
        setValue={(value) => setSearch(value)}
        placeholder="Search developers..."
      />
      <div>Total Selected: {selectedUserIds.length}</div>
      <div onClick={clearSelectedUsers}>Deselect All</div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="rounded-md border border-border bg-surface-muted px-3 py-6 text-center text-sm text-text-muted">
            Searching developers...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-md border border-warning-border bg-warning-muted px-3 py-3 text-sm text-warning">
            {error}
          </div>
        ) : null}

        {!loading && !error && users.length === 0 ? (
          <div className="rounded-md border border-border bg-surface-muted px-3 py-6 text-center text-sm text-text-muted">
            No developers found.
          </div>
        ) : null}

        {!loading && !error
          ? visibleUsers.map((user) => (
              <UserLookupResult
                key={user.id}
                user={user}
                onSelect={handleSelect}
                isSelected={Object.hasOwn(selectedUsersById, String(user.id))}
              />
            ))
          : null}
      </div>

      {users.length > USERS_PER_PAGE ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-text-muted">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
