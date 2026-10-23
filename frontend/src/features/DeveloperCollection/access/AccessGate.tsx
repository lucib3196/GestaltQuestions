import { useEffect, type ReactNode } from "react";

import { useRetrieveAccess } from "../../../hooks/collections";
import { useSingleCollectionStore } from "../singleCollectionStore";
import { buildCollectionCapabilities } from "./capabilities";
import { useFetchCollection } from "../../../hooks/collections";
type CollectionAccessGateProps = {
  collectionId: string;
  children: ReactNode;
};

export function CollectionAccessGate({
  collectionId,
  children,
}: CollectionAccessGateProps) {
  const { access, loading, error } = useRetrieveAccess(collectionId);
  const {
    collection,
    error: fetchError,
    loading: loadingCollection,
  } = useFetchCollection(collectionId);
  const setAccess = useSingleCollectionStore((s) => s.setAccess);
  const setCapabilities = useSingleCollectionStore((s) => s.setCapabilities);
  const clearAccess = useSingleCollectionStore((s) => s.clearAccess);
  const setCollectionData = useSingleCollectionStore(
    (s) => s.setNormalizeCollection,
  );
  const setSelectedCollection = useSingleCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  useEffect(() => {
    if (!collection) {
      console.log(fetchError, loadingCollection);
      return;
    }

    console.log("Current Collection", collection,);
    console.log("Access", access)

    setCollectionData([collection]);
    setSelectedCollection(collection.id);

    if (access?.collection_id === collectionId) {
      setAccess(access);
      setCapabilities(buildCollectionCapabilities(access.access_level));
    } else if (collection.status === "published") {
      clearAccess();
      setCapabilities(buildCollectionCapabilities("view"));
    } else {
      clearAccess();
    }

    return () => {
      clearAccess();
    };
  }, [
    access,
    clearAccess,
    collectionId,
    setAccess,
    setCapabilities,
    collection,
    loadingCollection,
  ]);

  if (loading || loadingCollection) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        Loading collection access...
      </div>
    );
  }

  if (fetchError || !collection) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        {fetchError ?? "Unable to load this collection."}
      </div>
    );
  }

  if (collection.status === "published") {
    return children;
  }

  if (error || !access || access.collection_id !== collectionId) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        You do not have access to this collection.
      </div>
    );
  }

  return children;
}
