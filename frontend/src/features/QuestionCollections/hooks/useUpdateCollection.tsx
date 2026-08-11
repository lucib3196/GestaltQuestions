import { useState } from "react";

import type { CollectionId, UpdateCollectionPayload } from "../../../services";
import { CollectionsApi } from "../../../services";
import { useAuth } from "../../Auth";
import { useCollectionStore } from "../instance/context";

function useUpdateCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  const setNormalizedCollections = useCollectionStore(
    (s) => s.setNormalizeCollection,
  );

  const updateCollection = async (
    collectionId: CollectionId,
    payload: UpdateCollectionPayload,
  ) => {
    if (!collectionId) {
      setError("Select a collection to update.");
      return null;
    }

    if (!user) {
      setError("Sign in to update collections.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const updatedCollection = await CollectionsApi.updateCollection(
        token,
        collectionId,
        payload,
      );
      const collections = await CollectionsApi.getCollections(token);

      setNormalizedCollections(collections);
      return updatedCollection;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update collection.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateCollection };
}

export function useUpdateCollectionTitle() {
  const { loading, error, updateCollection } = useUpdateCollection();

  const updateCollectionTitle = async (
    collectionId: CollectionId,
    title: string,
  ) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return null;
    }

    return updateCollection(collectionId, { title: trimmedTitle });
  };

  return { loading, error, updateCollectionTitle };
}

export function useUpdateCollectionParent() {
  const { loading, error, updateCollection } = useUpdateCollection();

  const updateCollectionParent = async (
    sourceCollectionId: string,
    targetCollectionId: string | null,
  ) => {
    if (!sourceCollectionId || sourceCollectionId === targetCollectionId) {
      return null;
    }

    return updateCollection(sourceCollectionId, {
      parent_id: targetCollectionId,
    });
  };

  return { loading, error, updateCollectionParent };
}

export default useUpdateCollection;
