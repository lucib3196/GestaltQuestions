import { useState } from "react";
import { CollectionsApi } from "../../../services";
import type { CollectionId } from "../../../services";
import { useAuth } from "../../Auth";
import { useCollectionStore } from "../instance/context";

export function useDeleteCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const selectedCollectionId = useCollectionStore(
    (s) => s.selectedCollectionId,
  );
  const setNormalizedCollections = useCollectionStore(
    (s) => s.setNormalizeCollection,
  );
  const setSelectedCollectionId = useCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  const deleteCollection = async (collectionId: CollectionId) => {
    if (!collectionId) {
      setError("Select a collection to delete.");
      return false;
    }

    if (!user) {
      setError("Sign in to delete collections.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      await CollectionsApi.deleteCollection(token, collectionId);
      const collections = await CollectionsApi.getCollections(token);

      setNormalizedCollections(collections);
      if (selectedCollectionId === collectionId) {
        setSelectedCollectionId("");
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete collection.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteCollection };
}
