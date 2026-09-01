import clsx from "clsx";
import { Check } from "lucide-react";
import type { UserDetailRead } from "../../../services";
import { UserAvatar } from "./UserAvatar";

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
      <UserAvatar user={user} isSelected={isSelected} />

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
