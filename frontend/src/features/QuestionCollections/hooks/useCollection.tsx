import { CollectionsApi } from "../../../services";
import { useEffect, useState } from "react";
import { useAuth } from "../../Auth";
import { useQuestionCollectionStore } from "../instance/store";

export function useCollections() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setNormalizedCollections = useQuestionCollectionStore(
    (s) => s.setNormalizeCollection,
  );
  const normalizedCollection = useQuestionCollectionStore(
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
      setError(null);
    }
  }
  useEffect(() => {
    fetchCollections();
  }, [user]);

  return {
    normalizedCollection,
    loading,
    error,
  };
}
