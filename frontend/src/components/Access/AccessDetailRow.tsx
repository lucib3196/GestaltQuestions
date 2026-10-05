import clsx from "clsx";
import { Trash2 } from "lucide-react";

import type {
  QuestionAccessDetailRead,
  ShareableAccessLevel,
} from "../../services/Access";
import { UserAvatar } from "../User";
import {
  accessDetailContainerStyles,
  type AccessDetailVariant,
} from "./accessDetailStyles";
import { ShareLevelPicker } from "./ShareLevelPicker";

type AccessDetailRowProps = {
  details: QuestionAccessDetailRead;
  disabled?: boolean;
  variant?: AccessDetailVariant;
  // eslint-disable-next-line no-unused-vars
  onLevelChange: (level: ShareableAccessLevel) => void;
  onRevokeAccess: () => void;
};

function getDisplayName(details: QuestionAccessDetailRead) {
  return (
    [details.first_name, details.last_name].filter(Boolean).join(" ") ||
    details.username ||
    details.email
  );
}

export function AccessDetailRow({
  details,
  disabled = false,
  variant = "panel",
  onLevelChange,
  onRevokeAccess,
}: AccessDetailRowProps) {
  const styles = accessDetailContainerStyles[variant];
  const displayName = getDisplayName(details);
  const isOwner = details.access_level === "owner";

  return (
    <article
      className={clsx(
        "flex min-h-16 items-center justify-between gap-4 overflow-visible border-b border-border last:border-b-0",
        styles.row,
      )}
    >
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

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">
            {displayName}
          </p>
          <p className="truncate text-xs text-text-muted">{details.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 overflow-visible">
        {isOwner ? (
          <select
            value="owner"
            disabled
            className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-text outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="owner">Owner</option>
          </select>
        ) : (
          <ShareLevelPicker
            value={details.access_level as ShareableAccessLevel}
            onChange={onLevelChange}
            disabled={disabled}
            dropdownClassName="left-auto right-0"
          />
        )}

        <button
          type="button"
          disabled={disabled || isOwner}
          onClick={onRevokeAccess}
          aria-label={`Remove access for ${details.email}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-warning-border hover:bg-warning-muted hover:text-warning disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
