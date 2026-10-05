import { useState } from "react";

import { useAuth } from "../../../services/Auth";
import CollectionsApi from "../../../services/Collections/api";
import type {
  CollectionId,
  UpdateCollectionPayload,
} from "../../../services/Collections/types";

export function useUpdateSingleCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateCollection(
    collectionId: CollectionId,
    payload: UpdateCollectionPayload,
  ) {
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
      return await CollectionsApi.updateCollection(token, collectionId, payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update collection.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, updateCollection };
}
