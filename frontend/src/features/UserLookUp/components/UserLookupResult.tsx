import clsx from "clsx";
import { Check } from "lucide-react";

import type { UserDetailRead } from "../../../services";

type UserLookupResultProps = {
  user: UserDetailRead;
  // eslint-disable-next-line no-unused-vars
  onSelect: (user: UserDetailRead) => void;
  isSelected: boolean;
};

export function UserLookupResult({
  user,
  onSelect,
  isSelected,
}: UserLookupResultProps) {
  const displayName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(user)}
      className={clsx(
        "flex min-h-20 w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        isSelected
          ? "border-accent bg-accent/10 text-text shadow-sm"
          : "border-border bg-surface text-text hover:border-border-strong hover:bg-surface-muted",
      )}
    >
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
          isSelected
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border-strong bg-surface-strong text-accent",
        )}
      >
        {initials || "U"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold">
            {displayName || user.username || "Unnamed user"}
          </h3>
          <span
            className={clsx(
              "rounded-md border px-2 py-0.5 text-xs",
              isSelected
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-border bg-surface-muted text-text-muted",
            )}
          >
            {isSelected ? "Selected" : "Developer"}
          </span>
        </div>

        <p className="truncate text-sm text-text-muted">{user.email}</p>
        <p className="truncate text-xs text-text-soft">
          {user.institution ?? "No institution listed"}
        </p>
        {user.username ? (
          <p className="truncate text-xs text-text-soft">@{user.username}</p>
        ) : null}
      </div>

      <div
        className={clsx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
          isSelected
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-surface-muted text-transparent",
        )}
        aria-hidden="true"
      >
        <Check className="h-4 w-4" />
      </div>
    </button>
  );
}
