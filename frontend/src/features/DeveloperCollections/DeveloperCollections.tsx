import { useState } from "react";
import Header from "./components/Header";
import CollectionsTabs from "./components/CollectionsTab";
import type { CollectionView } from "./types";

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

function CollectionViewPlaceholder({
  activeView,
}: {
  activeView: CollectionView;
}) {
  const copy = EMPTY_STATE_COPY[activeView];

  return (
    <section className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center shadow-soft">
      <h2 className="text-lg font-semibold text-text">{copy.title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
        {copy.description}
      </p>
    </section>
  );
}

export default function DeveloperCollections() {
  const [activeView, setActiveView] =
    useState<CollectionView>("myCollections");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-lg border border-border bg-surface p-5 text-text shadow-soft">
      <Header onCreateCollection={() => console.log("Create collection")} />
      <CollectionsTabs activeView={activeView} onChange={setActiveView} />
      <CollectionViewPlaceholder activeView={activeView} />
    </div>
  );
}
