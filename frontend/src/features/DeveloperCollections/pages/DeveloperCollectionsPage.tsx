import { useState } from "react";

import { Modal } from "../../../components/Modal";
import { CollectionProvider } from "../../../stores/collections";
import { CollectionGrid } from "../components/CollectionGrid";
import CollectionsHeader from "../components/CollectionsHeader";
import CollectionsTabs from "../components/CollectionsTabs";
import CreateCollectionForm from "../components/CreateCollectionForm";
import type { CollectionView } from "../types";

export default function DeveloperCollections() {
  const [activeView, setActiveView] = useState<CollectionView>("myCollections");
  const [showCreate, setShowCreate] = useState<boolean>(false);

  return (
    <CollectionProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-lg border border-border bg-surface p-5 text-text shadow-soft">
        <CollectionsHeader onCreateCollection={() => setShowCreate(true)} />
        <CollectionsTabs activeView={activeView} onChange={setActiveView} />
        <CollectionGrid activeView={activeView} />
      </div>
      {showCreate ? (
        <Modal variant="small" setShowModal={(val) => setShowCreate(val)}>
          <CreateCollectionForm
            onCancel={() => setShowCreate(false)}
            onCreated={() => setShowCreate(false)}
          />
        </Modal>
      ) : null}
    </CollectionProvider>
  );
}
