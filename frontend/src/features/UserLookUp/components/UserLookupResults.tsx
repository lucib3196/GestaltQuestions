import type { UserDetailRead } from "../../../services";
import type { SelectedUsersById } from "../instance/store";
import { UserLookupResult } from "./UserLookupResult";

type UserLookupResultsProps = {
  isCompact: boolean;
  users: UserDetailRead[];
  visibleUsers: UserDetailRead[];
  loading: boolean;
  error: string | null;
  selectedUsersById: SelectedUsersById;
  // eslint-disable-next-line no-unused-vars
  onSelect: (user: UserDetailRead) => void;
};

export function UserLookupResults({
  isCompact,
  users,
  visibleUsers,
  loading,
  error,
  selectedUsersById,
  onSelect,
}: UserLookupResultsProps) {
  return (
    <div className={isCompact ? "mt-2 space-y-2" : "mt-4 space-y-2"}>
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

      {!loading && !error && visibleUsers.length > 0 ? (
        <div className="w-full overflow-y-auto rounded-md border border-border bg-surface p-2 shadow-soft">
          <div className="space-y-2">
            {visibleUsers.map((user, index) => (
              <UserLookupResult
                key={user.id}
                user={user}
                onSelect={onSelect}
                isSelected={Object.hasOwn(selectedUsersById, String(user.id))}
                className="animate-in fade-in slide-in-from-bottom-1 duration-150"
                style={{ animationDelay: `${index * 45}ms` }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
