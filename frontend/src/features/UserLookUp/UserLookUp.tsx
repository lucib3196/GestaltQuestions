import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useMemo, useState } from "react";

import { SearchBar } from "../../components/SearchBar";
import {
  SelectedUsersTray,
  UserLookupHeader,
  UserLookupPagination,
  UserLookupResults,
} from "./components";
import { useUserLookup } from "./hooks/useUserLookUp";
import { useUserLookupStore } from "./instance/context";

const USERS_PER_PAGE = 3;

export type UserLookupVariant = "panel" | "embedded" | "compact" | "plain";

type UserLookUpProps = {
  excluded?: string[];
  variant?: UserLookupVariant;
};

const variantClassName: Record<UserLookupVariant, string> = {
  panel:
    "w-full max-w-xl rounded-md border border-border bg-surface p-4 text-text",
  embedded:
    "w-full rounded-md border border-border bg-surface-secondary p-3 text-text",
  compact: "w-full text-text",
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
  const showHeader = variant !== "compact";
  const isCompact = variant === "compact";

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
      {showHeader ? (
        <UserLookupHeader
          selectedCount={selectedUserIds.length}
          onClear={clearSelectedUsers}
        />
      ) : null}

      <SearchBar
        value={search}
        setValue={(value) => setSearch(value)}
        placeholder="Enter name or email"
      />

      <SelectedUsersTray
        isCompact={isCompact}
        selectedUsersById={selectedUsersById}
        onRemove={(user) => removeSelectedUser(user.id)}
      />

      <UserLookupResults
        isCompact={isCompact}
        users={users}
        visibleUsers={visibleUsers}
        loading={loading}
        error={error}
        selectedUsersById={selectedUsersById}
        onSelect={toggleSelectedUser}
      />

      <UserLookupPagination
        show={users.length > USERS_PER_PAGE}
        page={page}
        totalPages={totalPages}
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />
    </div>
  );
}
