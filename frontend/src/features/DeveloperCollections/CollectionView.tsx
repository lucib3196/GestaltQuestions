import { Edit3, Folder, Plus, Share2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useFetchCollection } from "../QuestionCollections/hooks/useFetchCollection";

const DEFAULT_COLLECTION_COLOR = "var(--color-accent)";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return dateFormatter.format(date);
}

export default function CollectionView() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { collection, loading, error } = useFetchCollection(collectionId);

  if (loading) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 text-text shadow-soft">
        <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-border bg-bg text-sm font-medium text-text-muted">
          Loading collection...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-warning-border bg-warning-muted p-6 text-warning shadow-soft">
        <h1 className="text-lg font-semibold">Unable to load collection</h1>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    );
  }

  if (!collection) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 text-text shadow-soft">
        <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-border bg-bg text-sm font-medium text-text-muted">
          Select a collection to view its details.
        </div>
      </section>
    );
  }

  const accentColor = collection.customization?.color || DEFAULT_COLLECTION_COLOR;
  const icon = collection.customization?.icon?.trim();
  const updatedDate = formatDate(collection.updated_at);
  const createdDate = formatDate(collection.created_at);

  return (
    <section className="rounded-lg border border-border bg-surface p-6 text-text shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <nav className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <Link
            to="/question_builder/collections"
            className="text-accent transition hover:text-accent-strong"
          >
            Collections
          </Link>
          <span className="text-text-tertiary">/</span>
          <span className="min-w-0 truncate text-text-muted">
            {collection.title}
          </span>
        </nav>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => console.log("Add questions", collection.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg shadow-sm transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Plus className="size-5" aria-hidden="true" />
            Add questions
          </button>
          <button
            type="button"
            onClick={() => console.log("Share collection", collection.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface-secondary px-4 text-sm font-semibold text-text-muted shadow-sm transition hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Share2 className="size-5" aria-hidden="true" />
            Share collection
          </button>
          <button
            type="button"
            onClick={() => console.log("Edit collection details", collection.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface-secondary px-4 text-sm font-semibold text-text-muted shadow-sm transition hover:border-border-strong hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Edit3 className="size-5" aria-hidden="true" />
            Edit details
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center">
        <div
          className="flex size-32 shrink-0 items-center justify-center rounded-lg border text-5xl font-semibold shadow-sm"
          style={{
            borderColor: accentColor,
            backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
            color: accentColor,
          }}
        >
          {icon ? (
            <span aria-hidden="true">{icon}</span>
          ) : (
            <Folder className="size-16" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 text-3xl font-semibold leading-tight text-text">
              {collection.title}
            </h1>
            <span className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-sm font-semibold text-text-muted">
              Collection
            </span>
          </div>

          <p className="mt-3 max-w-4xl text-base leading-7 text-text-muted">
            {collection.description?.trim() ||
              "No description has been added for this collection yet."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-text-muted">
            <span>{collection.children?.length ?? 0} subcollections</span>
            {createdDate ? <span>· Created {createdDate}</span> : null}
            {updatedDate ? <span>· Updated {updatedDate}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
