import { ArrowRight, Plus } from "lucide-react";
type CollectionQuestionsEmptyStateProps = {
  collectionTitle: string;
  canAddQuestions: boolean;
  onAddQuestions: () => void;
  onCreateQuestion: () => void;
};

export function CollectionQuestionsEmptyState({
  collectionTitle,
  canAddQuestions,
  onAddQuestions,
  onCreateQuestion,
}: CollectionQuestionsEmptyStateProps) {
  return (
    <div className="flex min-h-110 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-8 h-28 w-36 text-text-soft">
        <div className="absolute left-11 top-0 h-20 w-28 rounded-md border-2 border-text-tertiary/80" />
        <div className="absolute left-6 top-4 h-20 w-28 rounded-md border-2 border-text-soft/90" />
        <div className="absolute left-0 top-8 flex h-20 w-28 items-center justify-center rounded-md border-2 border-text-muted bg-bg">
          <span className="mr-3 text-4xl font-light">?</span>
          <span className="space-y-2">
            <span className="block h-0.5 w-12 rounded bg-text-muted" />
            <span className="block h-0.5 w-10 rounded bg-text-soft" />
            <span className="block h-0.5 w-8 rounded bg-text-tertiary" />
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-semibold tracking-normal text-text">
        Your collection is ready
      </h2>
      {canAddQuestions ? (
        <>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
            Add questions from your library to start building {collectionTitle}.
          </p>
          <button
            type="button"
            onClick={onAddQuestions}
            className="mt-8 inline-flex h-12 items-center justify-center gap-3 rounded-md bg-accent px-8 text-sm font-semibold text-bg shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Plus className="size-5" aria-hidden="true" />
            Add questions
          </button>
          <button
            type="button"
            onClick={onCreateQuestion}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:underline"
          >
            Create a new question
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : (
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
          This published collection does not contain any questions.
        </p>
      )}
    </div>
  );
}
