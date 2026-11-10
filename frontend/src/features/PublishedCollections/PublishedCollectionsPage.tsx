import { Bookmark } from "lucide-react";
import { useState } from "react";

import { CollectionGrid } from "../DeveloperCollections/components/CollectionGrid";
import type { CollectionView } from "../DeveloperCollections/types";

export default function PublishedCollectionsPage() {
  const [activeView, setActiveView] =
    useState<CollectionView>("publicCollections");
  const isViewingBookmarks = activeView === "bookmarkedCollections";

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-strong px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Published collections
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            Browse collections shared by the community.
          </p>
        </div>
        <button
          type="button"
          aria-pressed={isViewingBookmarks}
          onClick={() =>
            setActiveView(
              isViewingBookmarks
                ? "publicCollections"
                : "bookmarkedCollections",
            )
          }
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-md border border-border bg-surface-secondary px-4 text-sm font-semibold text-text transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:self-auto"
        >
          <Bookmark
            className="size-4"
            fill={isViewingBookmarks ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {isViewingBookmarks ? "Browse published" : "View bookmarks"}
        </button>
      </div>

      <CollectionGrid
        activeView={activeView}
        refreshKey={0}
        collectionBasePath="/collections"
      />
    </section>
  );
}
