import { useDebounce } from "@uidotdev/usehooks";
import clsx from "clsx";
import { type KeyboardEvent, useMemo, useState } from "react";

import type { UserDetailRead } from "../../../services";
import { useUserLookup } from "../hooks/useUserLookUp";
import { useUserLookupStore } from "../instance/context";
import { SelectedUserKeyList } from "./SelectedUserKeyList";
import { UserLookupResult } from "./UserLookupResult";

const USERS_PER_PAGE = 5;
const SEARCH_DEBOUNCE_MS = 250;

function getUserId(user: UserDetailRead) {
  return String(user.id);
}

function isCommitKey(key: string) {
  return key === "Enter" || key === ",";
}

function isBackspaceKey(key: string) {
  return key === "Backspace";
}

type UserLookupComboboxProps = {
  excluded?: string[];
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  maxResults?: number;
  className?: string;
  inputClassName?: string;
  resultsClassName?: string;
};

export function UserLookupCombobox({
  excluded,
  id = "user-select",
  placeholder = "Search people to share with",
  ariaLabel = "Search people to share with",
  maxResults = USERS_PER_PAGE,
  className,
  inputClassName,
  resultsClassName,
}: UserLookupComboboxProps) {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;

  const selectedUsersById = useUserLookupStore((s) => s.selectedUsersById);
  const addSelectedUser = useUserLookupStore((s) => s.addSelectedUser);
  const removeSelectedUser = useUserLookupStore((s) => s.removeSelectedUser);
  const { users, loading, error } = useUserLookup(debouncedSearch, excluded);

  const availableUsers = useMemo(() => {
    return users
      .filter((user) => !Object.hasOwn(selectedUsersById, getUserId(user)))
      .slice(0, maxResults);
  }, [maxResults, users, selectedUsersById]);

  const selectUser = (user: UserDetailRead) => {
    addSelectedUser(user);
    setSearch("");
  };

  const removeUser = (user: UserDetailRead) => {
    removeSelectedUser(getUserId(user));
  };

  const removeLastSelectedUser = () => {
    const lastSelectedUser = Object.values(selectedUsersById).at(-1);
    if (!lastSelectedUser) {
      return false;
    }

    removeSelectedUser(getUserId(lastSelectedUser));
    return true;
  };

  const handleSearchKeyDown = (event: KeyboardEvent) => {
    if (isCommitKey(event.key)) {
      if (event.repeat || event.nativeEvent.isComposing) {
        return;
      }

      event.preventDefault();

      const userToSelect = availableUsers[0];
      if (!hasSearch || loading || error || !userToSelect) {
        return;
      }

      return selectUser(userToSelect);
    }

    if (isBackspaceKey(event.key) && !hasSearch && removeLastSelectedUser()) {
      event.preventDefault();
    }
  };

  const shouldShowResults =
    hasSearch && !loading && !error && availableUsers.length > 0;

  return (
    <div className={clsx("relative w-full", className)}>
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-md border border-border bg-bg px-2 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
        <SelectedUserKeyList
          selectedUsersById={selectedUsersById}
          onRemove={removeUser}
        />

        <input
          id={id}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          type="text"
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={clsx(
            "min-w-48 flex-1 bg-transparent px-1 py-1.5 text-sm text-text outline-none placeholder:text-text-muted",
            inputClassName,
          )}
        />
      </div>

      {shouldShowResults ? (
        <div
          className={clsx(
            "absolute left-0 right-0 z-20 mt-2 max-h-80 space-y-2 overflow-y-auto rounded-md border border-border bg-surface p-2 shadow-soft",
            resultsClassName,
          )}
        >
          {availableUsers.map((user, index) => (
            <div
              key={user.id}
              className="animate-in fade-in slide-in-from-bottom-1 duration-150"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <UserLookupResult
                user={user}
                onSelect={selectUser}
                isSelected={Object.hasOwn(selectedUsersById, String(user.id))}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
