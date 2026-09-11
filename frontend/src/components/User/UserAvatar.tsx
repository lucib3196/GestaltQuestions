import clsx from "clsx";

export type UserAvatarPayload = {
  email: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  id?: string | null;
};

type UserAvatarProps = {
  user: UserAvatarPayload;
  isSelected?: boolean;
  showDetails?: boolean;
  size?: "sm" | "md";
};

const avatarColors = [
  "border-sky-600/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/35 dark:bg-sky-400/10 dark:text-sky-100",
  "border-teal-600/25 bg-teal-500/10 text-teal-700 dark:border-teal-400/35 dark:bg-teal-400/10 dark:text-teal-100",
  "border-amber-600/30 bg-amber-500/12 text-amber-800 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-100",
  "border-rose-600/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/35 dark:bg-rose-400/10 dark:text-rose-100",
  "border-fuchsia-600/25 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-400/35 dark:bg-fuchsia-400/10 dark:text-fuchsia-100",
  "border-indigo-600/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/35 dark:bg-indigo-400/10 dark:text-indigo-100",
];

const avatarSizeClassName = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-10 w-10 text-sm",
};

function getStableColor(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function UserAvatar({
  user,
  isSelected = false,
  showDetails = true,
  size = "md",
}: UserAvatarProps) {
  const displayName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`;
  const avatarColor = getStableColor(
    user.id ?? user.email ?? user.username ?? "user",
  );

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
        {initials || user.email[0]?.toUpperCase() || "U"}
      </div>

      {showDetails ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text">
            {displayName || user.username || user.email}
          </p>
          <p className="truncate text-sm text-text-muted">{user.email}</p>
          {user.username ? (
            <p className="truncate text-xs text-text-soft">@{user.username}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
