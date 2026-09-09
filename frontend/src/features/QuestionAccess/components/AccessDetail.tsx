import clsx from "clsx";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { UserAvatar } from "../../../components/User";
import {
  type QuestionAccessDetailRead,
  type ShareableAccessLevel,
  useListSharedByMe,
  useRevokeQuestionAccess,
  useUpdateQuestionShare,
} from "../../../services/Access/QuestionAccess";

const editableAccessLevels: ShareableAccessLevel[] = ["view", "edit", "full"];

const accessDetailContainerStyles = {
  panel: {
    section:
      "rounded-md border border-border bg-surface-secondary text-text shadow-soft",
    header: "border-b border-border px-4 py-3",
    body: "px-4",
    row: "px-1 py-4",
    status: "px-4 py-5",
  },
  embedded: {
    section: "rounded-md border border-border bg-surface-secondary text-text",
    header: "border-b border-border px-3 py-3",
    body: "px-3",
    row: "px-0 py-3",
    status: "px-3 py-4",
  },
  compact: {
    section: "rounded-md border border-border bg-surface text-text",
    header: "border-b border-border px-3 py-2",
    body: "px-3",
    row: "px-0 py-2.5",
    status: "px-3 py-3",
  },
} as const;

export type AccessDetailVariant = keyof typeof accessDetailContainerStyles;

type AccessDetailProps = {
  details: QuestionAccessDetailRead;
  disabled?: boolean;
  variant?: AccessDetailVariant;
  onLevelChange: (level: ShareableAccessLevel) => void;
  onRevokeAccess: () => void;
};

export function AccessDetail({
  details,
  disabled = false,
  variant = "panel",
  onLevelChange,
  onRevokeAccess,
}: AccessDetailProps) {
  const styles = accessDetailContainerStyles[variant];

  const isOwner = details.access_level === "owner";

  return (
    <article
      className={clsx(
        "flex min-h-16 items-center justify-between gap-4 border-b border-border last:border-b-0",
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
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          value={details.access_level}
          disabled={disabled || isOwner}
          onChange={(event) =>
            onLevelChange(event.target.value as ShareableAccessLevel)
          }
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text outline-none transition-colors hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isOwner ? <option value="owner">Owner</option> : null}
          {editableAccessLevels.map((level) => (
            <option key={level} value={level}>
              {level[0].toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

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

type AccessDetailContainerProps = {
  qid: string | null;
  loading?: boolean;
  variant?: AccessDetailVariant;
};

function AccessDetailStatus({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "warning";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "text-sm",
        tone === "warning" ? "text-warning" : "text-text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AccessDetailContainer({
  qid,
  loading = false,
  variant = "panel",
}: AccessDetailContainerProps) {
  if (!qid) return null;

  return (
    <AccessDetailContainerContent
      qid={qid}
      loading={loading}
      variant={variant}
    />
  );
}

function AccessDetailContainerContent({
  qid,
  loading = false,
  variant = "panel",
}: AccessDetailContainerProps & { qid: string }) {
  const styles = accessDetailContainerStyles[variant];
  const { updateQuestionShare, loading: updatingAccess } =
    useUpdateQuestionShare();
  const {
    access: detailRead,
    loading: detailsLoading,
    error: detailsError,
    refresh,
  } = useListSharedByMe(qid);
  const { revokeQuestionAccess, loading: revokingAccess } =
    useRevokeQuestionAccess();

  async function handleRevokeAccess(userId: string) {
    const result = await revokeQuestionAccess(qid, userId);
    if (result) {
      void refresh();
    }
  }

  const isLoading = loading || detailsLoading;
  const isBusy = loading || updatingAccess || revokingAccess;

  async function handleLevelChange(
    userId: string,
    level: ShareableAccessLevel,
  ) {
    const result = await updateQuestionShare(qid, userId, level);

    if (result) {
      void refresh();
    }
  }

  return (
    <section className={styles.section}>
      <header
        className={clsx(
          "flex items-center justify-between gap-3",
          styles.header,
        )}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">
            People with access
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Review collaborators and update their permission level.
          </p>
        </div>

        {!isLoading && !detailsError ? (
          <span className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-text-muted">
            {detailRead.length} {detailRead.length === 1 ? "person" : "people"}
          </span>
        ) : null}
      </header>

      <div className={styles.body}>
        {isLoading ? (
          <AccessDetailStatus className={styles.status}>
            Loading shared access...
          </AccessDetailStatus>
        ) : null}

        {!isLoading && detailsError ? (
          <AccessDetailStatus tone="warning" className={styles.status}>
            {detailsError}
          </AccessDetailStatus>
        ) : null}

        {!isLoading && !detailsError && detailRead.length === 0 ? (
          <AccessDetailStatus className={styles.status}>
            No one else has access yet.
          </AccessDetailStatus>
        ) : null}

        {!isLoading && !detailsError
          ? detailRead.map((details) => (
              <AccessDetail
                key={details.id ?? details.developer_id}
                details={details}
                disabled={isBusy}
                variant={variant}
                onLevelChange={(level) =>
                  handleLevelChange(details.user_id, level)
                }
                onRevokeAccess={() => handleRevokeAccess(details.user_id)}
              />
            ))
          : null}
      </div>
    </section>
  );
}
