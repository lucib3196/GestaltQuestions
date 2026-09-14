import { useState } from "react";
import Header from "./components/Header";
import CollectionsTabs from "./components/CollectionsTab";
import { CollectionCard } from "./components/CollectionCard";
import CreateCollection from "./components/CreateCollection";
import type { CollectionView } from "./types";
import { CollectionProvider } from "../QuestionCollections/instance/context";
import { useCollections } from "../QuestionCollections/hooks/useCollection";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal";
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
  const { normalizedCollection, loading, error } = useCollections();
  const copy = EMPTY_STATE_COPY[activeView];
  const collections =
    activeView === "myCollections"
      ? Object.values(normalizedCollection.byId)
      : [];

  const navigate = useNavigate();

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
        <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 text-center">
          <h2 className="text-lg font-semibold text-text">{copy.title}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
            {copy.description}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id ?? collection.title}
              collection={collection}
              onOpen={(selectedCollection) => {
                console.log("Going to collection", selectedCollection.id);
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

export default function DeveloperCollections() {
  const [activeView, setActiveView] = useState<CollectionView>("myCollections");
  const [showCreate, setShowCreate] = useState<boolean>(false);

  return (
    <CollectionProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-lg border border-border bg-surface p-5 text-text shadow-soft">
        <Header onCreateCollection={() => setShowCreate(true)} />
        <CollectionsTabs activeView={activeView} onChange={setActiveView} />
        <CollectionViewPlaceholder activeView={activeView} />
      </div>
      {showCreate ? (
        <Modal variant="small" setShowModal={(val) => setShowCreate(val)}>
          <CreateCollection
            onCancel={() => setShowCreate(false)}
            onCreated={() => setShowCreate(false)}
          />
        </Modal>
      ) : null}
    </CollectionProvider>
  );
}
