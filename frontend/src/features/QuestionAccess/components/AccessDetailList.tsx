import clsx from "clsx";
import type { ReactNode } from "react";

import {
  accessDetailContainerStyles,
  AccessDetailRow,
  type AccessDetailVariant,
} from "../../../components/Access";
import {
  useRevokeQuestionAccess,
  useUpdateQuestionShare,
} from "../../../hooks/questionAccess";
import {
  type QuestionAccessDetailRead,
  type ShareableAccessLevel,
} from "../../../services/Access";

type AccessDetailListProps = {
  qid: string;
  access: QuestionAccessDetailRead[];
  loading?: boolean;
  error?: string | null;
  variant?: AccessDetailVariant;
  onAccessChanged?: () => unknown;
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

export function AccessDetailList({
  qid,
  access,
  loading = false,
  error = null,
  variant = "panel",
  onAccessChanged,
}: AccessDetailListProps) {
  const styles = accessDetailContainerStyles[variant];
  const { updateQuestionShare, loading: updatingAccess } =
    useUpdateQuestionShare();
  const { revokeQuestionAccess, loading: revokingAccess } =
    useRevokeQuestionAccess();

  async function handleRevokeAccess(userId: string) {
    const result = await revokeQuestionAccess(qid, userId);
    if (result) {
      void onAccessChanged?.();
    }
  }

  const isLoading = loading;
  const isBusy = loading || updatingAccess || revokingAccess;

  async function handleLevelChange(
    userId: string,
    level: ShareableAccessLevel,
  ) {
    const result = await updateQuestionShare(qid, userId, level);

    if (result) {
      void onAccessChanged?.();
    }
  }

  return (
    <section className={clsx(styles.section, "overflow-visible")}>
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

        {!isLoading && !error ? (
          <span className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-text-muted">
            {access.length} {access.length === 1 ? "person" : "people"}
          </span>
        ) : null}
      </header>

      <div className={clsx(styles.body, "overflow-visible")}>
        {isLoading ? (
          <AccessDetailStatus className={styles.status}>
            Loading shared access...
          </AccessDetailStatus>
        ) : null}

        {!isLoading && error ? (
          <AccessDetailStatus tone="warning" className={styles.status}>
            {error}
          </AccessDetailStatus>
        ) : null}

        {!isLoading && !error && access.length === 0 ? (
          <AccessDetailStatus className={styles.status}>
            No one else has access yet.
          </AccessDetailStatus>
        ) : null}

        {!isLoading && !error
          ? access.map((details) => (
              <AccessDetailRow
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

export type { AccessDetailVariant };
