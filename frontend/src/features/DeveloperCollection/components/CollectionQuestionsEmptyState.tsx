import { ArrowRight, Plus } from "lucide-react";

type CollectionQuestionsEmptyStateProps = {
  collectionTitle: string;
  onAddQuestions: () => void;
  onCreateQuestion: () => void;
};

export function CollectionQuestionsEmptyState({
  collectionTitle,
  onAddQuestions,
  onCreateQuestion,
}: CollectionQuestionsEmptyStateProps) {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-8 h-28 w-36 text-slate-500">
        <div className="absolute left-11 top-0 h-20 w-28 rounded-md border-2 border-slate-600/80" />
        <div className="absolute left-6 top-4 h-20 w-28 rounded-md border-2 border-slate-500/90" />
        <div className="absolute left-0 top-8 flex h-20 w-28 items-center justify-center rounded-md border-2 border-slate-400 bg-slate-950">
          <span className="mr-3 text-4xl font-light">?</span>
          <span className="space-y-2">
            <span className="block h-0.5 w-12 rounded bg-slate-400" />
            <span className="block h-0.5 w-10 rounded bg-slate-500" />
            <span className="block h-0.5 w-8 rounded bg-slate-600" />
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-semibold tracking-normal text-slate-50">
        Your collection is ready
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
        Add questions from your library to start building {collectionTitle}.
      </p>

      <button
        type="button"
        onClick={onAddQuestions}
        className="mt-8 inline-flex h-12 items-center justify-center gap-3 rounded-md bg-indigo-400 px-8 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/60"
      >
        <Plus className="size-5" aria-hidden="true" />
        Add questions
      </button>

      <button
        type="button"
        onClick={onCreateQuestion}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
      >
        Create a new question
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
