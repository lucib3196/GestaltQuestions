import { Edit3, Plus, RotateCcw, Send, Share2 } from "lucide-react";

import type { Status } from "../../../services";

type CollectionDetailHeaderProps = {
  title: string;
  canAddQuestions: boolean;
  canManageAccess: boolean;
  canUpdate: boolean;
  status: Status;
  isUpdatingStatus: boolean;
  onAddQuestions: () => void;
  onShareCollection: () => void;
  onEditDetails: () => void;
  onToggleStatus: () => void;
};

export function CollectionDetailHeader({
  canAddQuestions,
  canManageAccess,
  canUpdate,
  status,
  isUpdatingStatus,
  onAddQuestions,
  onShareCollection,
  onEditDetails,
  onToggleStatus,
}: CollectionDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-3">
        {canAddQuestions && (
          <button
            type="button"
            onClick={onAddQuestions}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-indigo-400 px-6 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/60"
          >
            <Plus className="size-5" aria-hidden="true" />
            Add questions
          </button>
        )}
        {canManageAccess && (
          <button
            type="button"
            onClick={onShareCollection}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-6 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50"
          >
            <Share2 className="size-5" aria-hidden="true" />
            Share collection
          </button>
        )}
        {canUpdate && (
          <button
            type="button"
            onClick={onEditDetails}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-6 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50"
          >
            <Edit3 className="size-5" aria-hidden="true" />
            Edit details
          </button>
        )}
        {canUpdate && (
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={isUpdatingStatus}
            className={
              status === "published"
                ? "inline-flex h-12 items-center justify-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-6 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50 disabled:cursor-not-allowed disabled:opacity-50"
                : "inline-flex h-12 items-center justify-center gap-3 rounded-md bg-indigo-400 px-6 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            {status === "published" ? (
              <RotateCcw className="size-5" aria-hidden="true" />
            ) : (
              <Send className="size-5" aria-hidden="true" />
            )}
            {isUpdatingStatus
              ? "Updating..."
              : status === "published"
                ? "Make draft"
                : "Publish"}
          </button>
        )}
      </div>
    </div>
  );
}
