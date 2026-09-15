import { Edit3, Plus, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

type CollectionDetailHeaderProps = {
  title: string;
  onAddQuestions: () => void;
  onShareCollection: () => void;
  onEditDetails: () => void;
};

export function CollectionDetailHeader({
  title,
  onAddQuestions,
  onShareCollection,
  onEditDetails,
}: CollectionDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
      <nav className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <Link
          to="/question_builder/collections"
          className="text-slate-500 transition hover:text-slate-300"
        >
          Collections
        </Link>
        <span className="text-slate-700">/</span>
        <span className="min-w-0 truncate text-slate-100">{title}</span>
      </nav>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAddQuestions}
          className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-indigo-400 px-6 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/60"
        >
          <Plus className="size-5" aria-hidden="true" />
          Add questions
        </button>
        <button
          type="button"
          onClick={onShareCollection}
          className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-6 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50"
        >
          <Share2 className="size-5" aria-hidden="true" />
          Share collection
        </button>
        <button
          type="button"
          onClick={onEditDetails}
          className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-6 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50"
        >
          <Edit3 className="size-5" aria-hidden="true" />
          Edit details
        </button>
      </div>
    </div>
  );
}
