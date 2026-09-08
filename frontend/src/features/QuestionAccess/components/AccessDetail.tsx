import { Trash2 } from "lucide-react";

import { UserAvatar } from "../../../components/User";
import type {
  QuestionAccessDetailRead,
  ShareableAccessLevel,
} from "../../../services/Access/QuestionAccess";

const editableAccessLevels: ShareableAccessLevel[] = ["view", "edit", "full"];

type Props = {
  details: QuestionAccessDetailRead;
  disabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  onLevelChange: (level: ShareableAccessLevel) => void;
  onRevokeAccess: () => void;
};

export function AccessDetail({
  details,
  disabled = false,
  onLevelChange,
  onRevokeAccess,
}: Props) {
  return (
    <article className="flex min-h-20 items-center justify-between gap-4 border-b border-border px-1 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          user={{
            id: details.user_id,
            email: details.email,
            username: details.username,
            first_name: details.first_name,
            last_name: details.last_name,
          }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          value={details.access_level}
          disabled={disabled || details.access_level === "owner"}
          onChange={(event) =>
            onLevelChange(event.target.value as ShareableAccessLevel)
          }
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition hover:border-border-strong focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {details.access_level === "owner" ? (
            <option value="owner">Owner</option>
          ) : null}
          {editableAccessLevels.map((level) => (
            <option key={level} value={level}>
              {level[0].toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={disabled || details.access_level === "owner"}
          onClick={onRevokeAccess}
          aria-label={`Remove access for ${details.email}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
