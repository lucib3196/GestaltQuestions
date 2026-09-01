import clsx from "clsx";
import { X } from "lucide-react";

import type { UserDetailRead } from "../../../services";
import { UserAvatar } from "./UserAvatar";

type SelectedUserKeyProps = {
  user: UserDetailRead;
  onRemove: (user: UserDetailRead) => void;
};

export function SelectedUserKey({ user, onRemove }: SelectedUserKeyProps) {
  const label = user.email || user.username || "Selected user";

  return (
    <span
      className={clsx(
        "inline-flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface-strong px-2 py-1 text-sm text-text shadow-sm transition-colors",
        "hover:border-border-strong hover:bg-surface-muted",
      )}
    >
      <UserAvatar
        user={user}
        isSelected={false}
        showDetails={false}
        size="sm"
      />

      <span className="max-w-44 truncate text-xs font-medium text-text-muted">
        {label}
      </span>

      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={() => onRemove(user)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted transition hover:bg-surface-secondary hover:text-text"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}
