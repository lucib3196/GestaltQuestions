import clsx from "clsx";
import type { ReactNode } from "react";

import {
  accessDetailContainerStyles,
  AccessDetailRow,
  type AccessDetailVariant,
} from "../../../components/Access";
import {
  useRevokeCollectionAccess,
  useUpdateCollectionShare,
} from "../../../hooks/collectionAccess";
import type {
  CollectionAccessDetailRead,
  ShareableAccessLevel,
} from "../../../services/Access";

type CollectionAccessDetailListProps = {
  collectionId: string;
  access: CollectionAccessDetailRead[];
  loading?: boolean;
  error?: string | null;
  variant?: AccessDetailVariant;
  onAccessChanged?: () => unknown;
};

function AccessDetailStatus({
  children,
  warning = false,
}: {
  children: ReactNode;
  warning?: boolean;
}) {
  return (
    <div
      className={clsx(
        "text-sm",
        warning ? "text-warning" : "text-text-muted",
      )}
    >
      {children}
    </div>
  );
}

export default function CollectionAccessDetailList({
  collectionId,
  access,
  loading = false,
  error = null,
  variant = "compact",
  onAccessChanged,
}: CollectionAccessDetailListProps) {
  const styles = accessDetailContainerStyles[variant];
  const { updateCollectionShare, loading: updatingAccess } =
    useUpdateCollectionShare();
  const { revokeCollectionAccess, loading: revokingAccess } =
    useRevokeCollectionAccess();
  const isBusy = loading || updatingAccess || revokingAccess;

  async function handleLevelChange(
    userId: string,
    level: ShareableAccessLevel,
  ) {
    const result = await updateCollectionShare(collectionId, userId, level);
    if (result) {
      void onAccessChanged?.();
    }
  }

  async function handleRevokeAccess(userId: string) {
    const result = await revokeCollectionAccess(collectionId, userId);
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
          <h2 className="text-sm font-semibold text-text">Who has access</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Review collaborators and update their permission level.
          </p>
        </div>
        {!loading && !error ? (
          <span className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-text-muted">
            {access.length} {access.length === 1 ? "person" : "people"}
          </span>
        ) : null}
      </header>

      <div className={clsx(styles.body, "overflow-visible")}>
        {loading ? (
          <AccessDetailStatus>Loading shared access...</AccessDetailStatus>
        ) : null}
        {!loading && error ? (
          <AccessDetailStatus warning>{error}</AccessDetailStatus>
        ) : null}
        {!loading && !error && access.length === 0 ? (
          <AccessDetailStatus>No one else has access yet.</AccessDetailStatus>
        ) : null}
        {!loading && !error
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
