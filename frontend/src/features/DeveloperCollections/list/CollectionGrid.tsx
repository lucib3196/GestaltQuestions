import { useNavigate } from "react-router-dom";

import { useCollections } from "../../QuestionCollections/hooks/useCollection";
import type { CollectionView } from "../types";
import { CollectionCard } from "./CollectionCard";
import { CollectionEmptyState } from "./CollectionEmptyState";

type CollectionGridProps = {
  activeView: CollectionView;
};

export function CollectionGrid({ activeView }: CollectionGridProps) {
  const { normalizedCollection, loading, error } = useCollections();
  const navigate = useNavigate();
  const collections =
    activeView === "myCollections"
      ? Object.values(normalizedCollection.byId)
      : [];

  return (
    <section className="min-h-96 rounded-lg border border-border bg-bg p-4 shadow-inner">
      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-border bg-surface text-sm font-medium text-text-muted">
          Loading collections...
        </div>
      ) : error ? (
        <div className="flex min-h-72 items-center justify-center rounded-md border border-warning-border bg-warning-muted px-6 text-center text-sm font-medium text-warning">
          {error}
        </div>
      ) : collections.length === 0 ? (
        <CollectionEmptyState activeView={activeView} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id ?? collection.title}
              collection={collection}
              onOpen={(selectedCollection) => {
                navigate(
                  `/question_builder/collections/${selectedCollection.id}`,
                );
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
