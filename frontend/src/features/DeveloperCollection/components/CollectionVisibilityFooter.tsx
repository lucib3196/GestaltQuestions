import { ArrowRight, Lock } from "lucide-react";

import type { Status } from "../../../services";
import { getStatusLabel } from "../../../services/Status";

type CollectionVisibilityFooterProps = {
  status: Status;
  canManageAccess: boolean;
  onManageSharing: () => void;
};

export function CollectionVisibilityFooter({
  status,
  canManageAccess,
  onManageSharing,
}: CollectionVisibilityFooterProps) {
  return (
    <footer className="mt-8 flex flex-col gap-4 border-t border-border pt-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Lock className="size-5 text-text-muted" aria-hidden="true" />
        <span>
          {getStatusLabel(status)} ·{" "}
          {status === "published" ? "Visible to others" : "Only visible to you"}
        </span>
      </div>

      {canManageAccess && (
        <button
          type="button"
          onClick={onManageSharing}
          className="inline-flex items-center gap-2 font-semibold text-accent transition hover:underline"
        >
          Manage sharing
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      )}
    </footer>
  );
}
