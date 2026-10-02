import { type ReactNode, useState } from "react";

import { ShareLevelPicker } from "../../components/Access";
import type { ShareableAccessLevel } from "../../services/Access";
import type { SelectedUsersById } from "../../stores/userLookUp";
import { UserLookupCombobox } from "../UserLookUp/components";
import { useUserLookupStore } from "../UserLookUp/instance/context";
import { UserLookupProvider } from "../UserLookUp/instance/context";

type ResourceSharingVariant = "bordered" | "borderless";

/* eslint-disable no-unused-vars */
type ShareFormActions<TResult, TPayload> = {
  primaryLabel?: string;
  secondaryLabel?: string;

  disableShare?: boolean;

  onClose?: () => void;
  onShared?: (result: TResult, payload: TPayload) => void;

  afterSuccess?: {
    clearUsers?: boolean;
    close?: boolean;
  };
};

type ResourceSharingProps<TResult, TPayload> = {
  title?: string;
  preview?: ReactNode;
  className?: string;
  variant?: ResourceSharingVariant;
  buildPayload: (
    input: SelectedUsersById,
    accessLevel: ShareableAccessLevel,
  ) => TPayload | null;
  shareResource: (payload: TPayload) => Promise<TResult | null>;
  actions?: ShareFormActions<TResult, TPayload>;
};
/* eslint-enable no-unused-vars */

export function ResourceSharingForm<ResultT, PayloadT>({
  title = "Share Resource",
  preview,
  className = "",
  variant = "bordered",
  buildPayload,
  shareResource,
  actions,
}: ResourceSharingProps<ResultT, PayloadT>) {
  const [accessLevel, setAccessLevel] = useState<ShareableAccessLevel>("view");
  const [loading, setLoading] = useState(false);
  const selectedUsers = useUserLookupStore((s) => s.selectedUsersById);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);
  const {
    primaryLabel = "Share",
    secondaryLabel = "Close",
    disableShare = false,
    onClose,
    onShared,
    afterSuccess,
  } = actions ?? {};
  const { clearUsers = true, close = false } = afterSuccess ?? {};
  const variantClassName =
    variant === "bordered"
      ? "rounded-lg border border-border bg-surface p-5 shadow-soft"
      : "bg-transparent p-0";

  const handleShare = async () => {
    const payload = buildPayload(selectedUsers, accessLevel);
    if (!payload) return;

    setLoading(true);
    try {
      const result = await shareResource(payload);
      if (!result) return;

      onShared?.(result, payload);

      if (clearUsers) clearSelectedUsers();
      if (close) onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`w-full text-text ${variantClassName} ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-button-secondary px-3 py-1.5 text-sm text-text-muted transition hover:border-border-strong hover:text-text"
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      {preview}

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">
            Add people
          </label>
          <UserLookupCombobox maxResults={3} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="question-share-access-level"
            className="text-sm font-medium text-text-muted"
          >
            Permissions
          </label>

          <ShareLevelPicker
            value={accessLevel}
            onChange={setAccessLevel}
            disabled={loading}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading || disableShare}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sharing..." : primaryLabel}
        </button>
      </div>
    </section>
  );
}

export default function ResourceSharing<ResultT, PayloadT>({
  ...props
}: ResourceSharingProps<ResultT, PayloadT>) {
  return (
    <UserLookupProvider>
      <ResourceSharingForm {...props} />
    </UserLookupProvider>
  );
}
