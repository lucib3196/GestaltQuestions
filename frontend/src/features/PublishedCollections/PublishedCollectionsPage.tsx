import { CollectionGrid } from "../DeveloperCollections/components/CollectionGrid";
import type { CollectionView } from "../DeveloperCollections/types";

const PUBLIC_COLLECTIONS_VIEW: CollectionView = "publicCollections";

export default function PublishedCollectionsPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="rounded-lg border border-border bg-surface-strong px-5 py-4 shadow-soft">
        <h1 className="text-2xl font-semibold text-text">
          Published collections
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          Browse collections shared by the community.
        </p>
      </div>

      <CollectionGrid
        activeView={PUBLIC_COLLECTIONS_VIEW}
        refreshKey={0}
        collectionBasePath="/collections"
      />
    </section>
  );
}
