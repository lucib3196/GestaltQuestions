import { ArrowUpRight } from "lucide-react";

import type { QuestionCollectionRead } from "../../../services";
import {
  getCollectionColor,
  getCollectionIcon,
} from "../utils/collectionCustomization";

export type CollectionCardProps = {
  collection: QuestionCollectionRead;
  onOpen: (collection: QuestionCollectionRead) => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return dateFormatter.format(date);
}

function getCollectionAccent(collection: QuestionCollectionRead) {
  return getCollectionColor(collection.customization?.color);
}

export function CollectionCard({ collection, onOpen }: CollectionCardProps) {
  const accentColor = getCollectionAccent(collection);
  const Icon = getCollectionIcon(collection.customization?.icon);
  const questionCount = collection.question_ids.length;

  return (
    <article className="group flex min-h-64 flex-col overflow-hidden rounded-lg border border-border bg-surface text-text shadow-soft transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg">
      <div className="h-2" style={{ backgroundColor: accentColor }} />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-md border text-lg font-semibold shadow-sm"
            style={{
              borderColor: accentColor,
              backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
              color: accentColor,
            }}
          >
            <Icon className="size-6" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-text">
            {collection.title}
          </h2>
          <p className="mt-2 line-clamp-3 min-h-15 text-sm leading-5 text-text-muted">
            {collection.description?.trim() || ""}
          </p>
        </div>

        <dl className="mt-5 mb-2 gap-2">
          <div className="rounded-md border border-border bg-bg px-3 py-2">
            <dt className="text-xs font-medium text-text-muted">Questions</dt>
            <dd className="mt-1 text-sm font-semibold text-text">
              {questionCount}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-xs font-medium text-text-muted">
            Updated {formatDate(collection.updated_at)}
          </span>

          <button
            type="button"
            onClick={() => onOpen(collection)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-secondary px-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Open
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
