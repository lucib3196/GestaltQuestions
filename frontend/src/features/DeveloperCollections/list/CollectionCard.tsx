import { ArrowRight, Globe2, ListChecks, LockKeyhole } from "lucide-react";

import type { QuestionCollectionRead } from "../../../services";
import {
  getCollectionColor,
  getCollectionIcon,
} from "../utils/collectionCustomization";

export type CollectionCardProps = {
  collection: QuestionCollectionRead;
  onOpen: (collection: QuestionCollectionRead) => void;
};

function getCollectionAccent(collection: QuestionCollectionRead) {
  return getCollectionColor(collection.customization?.color);
}

function getStatusLabel(status: QuestionCollectionRead["status"]) {
  return status === "published" ? "Public" : "Private";
}

export function CollectionCard({ collection, onOpen }: CollectionCardProps) {
  const accentColor = getCollectionAccent(collection);
  const Icon = getCollectionIcon(collection.customization?.icon);
  const questionCount = collection.question_ids.length;
  const isPublic = collection.status === "published";
  const AccessIcon = isPublic ? Globe2 : LockKeyhole;

  return (
    <article
      className="group flex min-h-96 flex-col overflow-hidden rounded-lg border bg-surface p-5 text-text shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 58%, var(--border))`,
      }}
    >
      <div
        className="relative flex h-40 items-center justify-center overflow-hidden rounded-lg border"
        style={{
          borderColor: `color-mix(in srgb, ${accentColor} 22%, transparent)`,
          background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 20%, transparent), color-mix(in srgb, ${accentColor} 8%, var(--surface-muted)))`,
        }}
      >
        <div
          className="absolute h-28 w-72 rounded-full border opacity-45"
          style={{
            borderColor: accentColor,
            transform: "rotate(-18deg)",
          }}
        />
        <div
          className="absolute h-24 w-64 rounded-full border opacity-35"
          style={{
            borderColor: accentColor,
            transform: "rotate(17deg)",
          }}
        />
        <div
          className="relative flex size-16 items-center justify-center rounded-full border bg-surface/80 shadow-sm"
          style={{
            borderColor: `color-mix(in srgb, ${accentColor} 55%, transparent)`,
            color: accentColor,
          }}
        >
          <Icon className="size-9" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 min-w-0">
        <h2 className="line-clamp-2 text-xl font-bold leading-snug text-text">
          {collection.title}
        </h2>
        <p className="mt-2 line-clamp-2 min-h-12 text-base leading-6 text-text-muted">
          {collection.description?.trim() || "No description added yet."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 16%, transparent)`,
            color: accentColor,
          }}
        >
          {collection.title.split(":")[0] || "Collection"}
        </span>
        <span className="inline-flex min-h-9 items-center rounded-md bg-surface-muted px-3 text-sm font-semibold text-text-muted">
          {getStatusLabel(collection.status)}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 py-6 text-sm font-medium text-text-muted">
        <span className="inline-flex items-center gap-2">
          <ListChecks className="size-5" aria-hidden="true" />
          {questionCount} {questionCount === 1 ? "question" : "questions"}
        </span>
        <span className="inline-flex items-center gap-2">
          <AccessIcon className="size-5" aria-hidden="true" />
          {getStatusLabel(collection.status)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(collection)}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-4 text-base font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 78%, #7c3aed))`,
        }}
      >
        Open collection
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>
    </article>
  );
}
