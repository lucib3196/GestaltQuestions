import clsx from "clsx";

import type { QuestionCollectionRead } from "../../../services";
type Props = {
  collection: QuestionCollectionRead;
  selectedCollections: Set<string>;
  onToggleSelected: (collection: QuestionCollectionRead) => void;
};
export function CollectionResult({
  collection,
  selectedCollections,
  onToggleSelected,
}: Props) {
  const collectionId = collection.id;
  const selected = collectionId ? selectedCollections.has(collectionId) : false;
  return (
    <button
      key={collection.id ?? collection.title}
      type="button"
      disabled={!collectionId}
      onClick={() => onToggleSelected(collection)}
      className="flex w-full items-center gap-3 rounded-md border border-border bg-surface-secondary px-3 py-3 text-left transition hover:border-border-strong hover:bg-surface-tertiary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={clsx(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
          selected
            ? "border-approval bg-approval text-approval-foreground"
            : "border-border-strong bg-surface-muted",
        )}
      >
        {selected && (
          <span className="h-2 w-2 rounded-full bg-approval-foreground" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text">
          {collection.title}
        </span>
        <span className="block text-xs text-text-soft">
          {collection.question_ids.length}{" "}
          {collection.question_ids.length === 1 ? "question" : "questions"}
        </span>
      </span>
    </button>
  );
}

type CollectionResultsProps = {
  collections: QuestionCollectionRead[];
  loading: boolean;
  error: string | null;
  selectedCollectionIds: Set<string>;
  onToggleCollection: (collection: QuestionCollectionRead) => void;
};

export function CollectionResults({
  collections,
  loading,
  error,
  selectedCollectionIds,
  onToggleCollection,
}: CollectionResultsProps) {
  if (loading) {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-4 py-6 text-center text-sm text-text-muted">
        Loading collections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-warning-border bg-warning-muted px-4 py-3 text-sm text-warning">
        {error}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-4 py-6 text-center text-sm text-text-muted">
        No collections found.
      </div>
    );
  }

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto ">
      {collections.map((collection) => (
        <CollectionResult
          collection={collection}
          selectedCollections={selectedCollectionIds}
          onToggleSelected={onToggleCollection}
        />
      ))}
    </div>
  );
}
