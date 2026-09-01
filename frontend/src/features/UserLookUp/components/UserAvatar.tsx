import clsx from "clsx";

import type { UserDetailRead } from "../../../services";

const avatarColors = [
  "border-sky-600/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/35 dark:bg-sky-400/10 dark:text-sky-100",
  "border-teal-600/25 bg-teal-500/10 text-teal-700 dark:border-teal-400/35 dark:bg-teal-400/10 dark:text-teal-100",
  "border-amber-600/30 bg-amber-500/12 text-amber-800 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-100",
  "border-rose-600/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/35 dark:bg-rose-400/10 dark:text-rose-100",
  "border-fuchsia-600/25 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-400/35 dark:bg-fuchsia-400/10 dark:text-fuchsia-100",
  "border-indigo-600/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/35 dark:bg-indigo-400/10 dark:text-indigo-100",
];

function getStableColor(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
}

type UserAvatarProps = {
  user: UserDetailRead;
  isSelected: boolean;
  showDetails?: boolean;
  size?: "sm" | "md";
};

const avatarSizeClassName = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-10 w-10 text-sm",
};

export function UserAvatar({
  user,
  isSelected,
  showDetails = true,
  size = "md",
}: UserAvatarProps) {
  const displayName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`;
  const avatarColor = getStableColor(String(user.id));

  return (
    <>
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-md border font-bold shadow-sm ring-1 ring-bg/60 transition-colors",
          avatarSizeClassName[size],
          isSelected
            ? "border-accent bg-accent text-accent-foreground ring-accent/20"
            : avatarColor,
        )}
      >
        {initials || "U"}
      </div>

      {showDetails ? (
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
      ) : null}
    </>
  );
}
