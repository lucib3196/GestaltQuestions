import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useFetchCollection } from "../../hooks/collections";
import { formatDate } from "../../utils/formattingUtils";
import { CollectionHeroIcon } from "../DeveloperCollection/components/customization/CollectionHeroIcon";
import { PublishedCollectionQuestions } from "./PublishedCollectionQuestions";

export default function PublishedCollectionPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  return (
    <PublishedCollectionDetail key={collectionId} collectionId={collectionId} />
  );
}

function PublishedCollectionDetail({
  collectionId,
}: {
  collectionId?: string;
}) {
  const { collection, loading, error } = useFetchCollection(collectionId);

  if (loading || (collectionId && !collection && !error)) {
    return (
      <div
        role="status"
        className="rounded-lg border border-border bg-surface p-5 text-sm text-text-muted"
      >
        Loading collection...
      </div>
    );
  }

  if (
    error ||
    !collectionId ||
    !collection ||
    collection.status !== "published"
  ) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-text-muted">
          {error ?? "This published collection could not be found."}
        </p>
        <Link
          to="/collections"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to collections
        </Link>
      </section>
    );
  }

  const createdDate = formatDate(collection.created_at);
  const updatedDate = formatDate(collection.updated_at);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
      <Link
        to="/collections"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Published collections
      </Link>

      <header className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-soft sm:flex-row sm:items-center sm:p-7">
        <CollectionHeroIcon
          customization={collection.customization}
          themeAware
        />

        <div className="min-w-0">
          <h1 className="wrap-break-word text-3xl font-semibold text-text">
            {collection.title}
          </h1>
          <p className="mt-2 max-w-3xl wrap-break-word text-sm text-text-muted">
            {collection.description?.trim() || "No description added yet."}
          </p>
          {(createdDate || updatedDate) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
              {createdDate && <span>Created {createdDate}</span>}
              {updatedDate && <span>Updated {updatedDate}</span>}
            </div>
          )}
        </div>
      </header>

      <PublishedCollectionQuestions
        collectionId={collectionId}
        questionCount={collection.question_ids.length}
      />
    </section>
  );
}
