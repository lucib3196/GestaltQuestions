import { CollectionsApi } from "../../../services";
import { useEffect, useState } from "react";
import { useAuth } from "../../Auth";

import type { QuestionCollection } from "../../../services";
export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<QuestionCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCollections() {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const collections = await CollectionsApi.getCollections(token);
      setCollections(collections);
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
    collections,
    loading,
    error,
  };
}
