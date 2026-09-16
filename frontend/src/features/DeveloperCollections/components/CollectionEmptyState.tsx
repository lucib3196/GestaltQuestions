import type { CollectionView } from "../types";

const EMPTY_STATE_COPY: Record<
  CollectionView,
  { title: string; description: string }
> = {
  myCollections: {
    title: "No collections yet",
    description:
      "Create collections to organize your questions and share what you know.",
  },
  sharedWithMe: {
    title: "Nothing shared with you yet",
    description: "Collections shared by other developers will appear here.",
  },
  publicCollections: {
    title: "No public collections yet",
    description: "Published collections from the community will appear here.",
  },
};

export function CollectionEmptyState({
  activeView,
}: {
  activeView: CollectionView;
}) {
  const copy = EMPTY_STATE_COPY[activeView];

  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 text-center">
      <h2 className="text-lg font-semibold text-text">{copy.title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
        {copy.description}
      </p>
    </div>
  );
}
