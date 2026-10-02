import { ArrowRight, Lock } from "lucide-react";

import type { Status } from "../../../services";
import { getStatusLabel } from "../../../services/Status";

type CollectionVisibilityFooterProps = {
  status: Status;
  onManageSharing: () => void;
};

export function CollectionVisibilityFooter({
  status,
  onManageSharing,
}: CollectionVisibilityFooterProps) {
  return (
    <footer className="mt-8 flex flex-col gap-4 border-t border-slate-700/80 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Lock className="size-5 text-slate-400" aria-hidden="true" />
        <span>
          {getStatusLabel(status)} ·{" "}
          {status === "published" ? "Visible to others" : "Only visible to you"}
        </span>
      </div>

      <button
        type="button"
        onClick={onManageSharing}
        className="inline-flex items-center gap-2 font-semibold text-indigo-300 transition hover:text-indigo-200"
      >
        Manage sharing
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </footer>
  );
}
