import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useMemo, useState } from "react";

import { SearchBar } from "../../components/SearchBar";
import type { UserDetailRead } from "../../services";
import { SelectedUserKeyList, UserLookupResult } from "./components";
import { useUserLookup } from "./hooks/useUserLookUp";
import { useUserLookupStore } from "./instance/context";

const USERS_PER_PAGE = 3;

export type UserLookupVariant = "panel" | "embedded" | "plain";

type UserLookUpProps = {
  excluded?: string[];
  variant?: UserLookupVariant;
};

const variantClassName: Record<UserLookupVariant, string> = {
  panel:
    "w-full max-w-xl rounded-md border border-border bg-surface p-4 text-text",
  embedded:
    "w-full rounded-md border border-border bg-surface-secondary p-3 text-text",
  plain: "w-full text-text",
};

export function UserLookUp({ excluded, variant = "panel" }: UserLookUpProps) {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 250);
  const selectedUsersById = useUserLookupStore((s) => s.selectedUsersById);
  const toggleSelectedUser = useUserLookupStore((s) => s.toggleSelectedUser);
  const removeSelectedUser = useUserLookupStore((s) => s.removeSelectedUser);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);
  const selectedUserIds = Object.keys(selectedUsersById);

  const handleSelect = (user: UserDetailRead) => {
    toggleSelectedUser(user);
  };

  const { users, loading, error } = useUserLookup(debouncedSearch, excluded);
  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const visibleUsers = useMemo(() => {
    const start = (page - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [page, users]);

  return (
    <div className={variantClassName[variant]}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Invite developers</h2>
          <p className="text-xs text-text-muted">
            Search and select people to share with.
          </p>
        </div>

        {selectedUserIds.length > 0 ? (
          <button
            type="button"
            onClick={clearSelectedUsers}
            className="shrink-0 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-muted hover:text-text"
          >
            Clear {selectedUserIds.length}
          </button>
        ) : null}
      </div>

      <SearchBar
        value={search}
        setValue={(value) => setSearch(value)}
        placeholder="Search developers..."
      />

      {selectedUserIds.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-border bg-surface-muted p-2">
          <SelectedUserKeyList
            selectedUsersById={selectedUsersById}
            onRemove={(user) => removeSelectedUser(user.id)}
          />
        </div>
      ) : null}

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
