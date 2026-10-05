import { useEffect, useState } from "react";

import type { ListCollectionsParams } from "../../services";
import { useAuth } from "../../services/Auth";
import CollectionsApi from "../../services/Collections/api";
import { useCollectionStore } from "../../stores/collections/context";

export function useCollections(params?: ListCollectionsParams) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setNormalizedCollections = useCollectionStore(
    (s) => s.setNormalizeCollection,
  );
  const normalizedCollection = useCollectionStore(
    (s) => s.normalizedCollection,
  );

  async function fetchCollections() {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const collections = await CollectionsApi.getCollections(token);
      setNormalizedCollections(collections);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCollections();
  }, [user, params]);

  return {
    normalizedCollection,
    fetchCollections,
    loading,
    error,
  };
}
