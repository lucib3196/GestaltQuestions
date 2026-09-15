import { useEffect, type ReactNode } from "react";

import { useRetrieveAccess } from "../../../hooks/collections";
import { useCollectionStore } from "../store";
import { buildCollectionCapabilities } from "./capabilities";

type CollectionAccessGateProps = {
  collectionId: string;
  children: ReactNode;
};

export function CollectionAccessGate({
  collectionId,
  children,
}: CollectionAccessGateProps) {
  const { access, loading, error } = useRetrieveAccess(collectionId);
  const setAccess = useCollectionStore((s) => s.setAccess);
  const setCapabilities = useCollectionStore((s) => s.setCapabilities);
  const clearAccess = useCollectionStore((s) => s.clearAccess);
  const setSelectedCollectionId = useCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  useEffect(() => {
    setSelectedCollectionId(collectionId);

    if (!access || access.collection_id !== collectionId) {
      clearAccess();
      return;
    }

    setAccess(access);
    setCapabilities(buildCollectionCapabilities(access.access_level));

    return () => {
      clearAccess();
    };
  }, [
    access,
    clearAccess,
    collectionId,
    setAccess,
    setCapabilities,
    setSelectedCollectionId,
  ]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        Loading collection access...
      </div>
    );
  }

  if (error || !access) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        You do not have access to this collection.
      </div>
    );
  }

  return children;
}
