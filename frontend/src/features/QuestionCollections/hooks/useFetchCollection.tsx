import { useCallback, useEffect, useState } from "react";

import { CollectionsApi } from "../../../services";
import { useAuth } from "../../../services/Auth";
import type { CollectionId, QuestionCollection } from "../../../services";

export function useFetchCollection(
  collectionId: CollectionId | null | undefined,
) {
  const { user } = useAuth();
  const [collection, setCollection] = useState<QuestionCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    if (!user || !collectionId) {
      setCollection(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const fetchedCollection = await CollectionsApi.getCollection(
        token,
        collectionId,
      );

      setCollection(fetchedCollection);
      return fetchedCollection;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setCollection(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [collectionId, user]);

  useEffect(() => {
    let isCurrent = true;

    async function loadCollection() {
      if (!user || !collectionId) {
        setCollection(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const fetchedCollection = await CollectionsApi.getCollection(
          token,
          collectionId,
        );

        if (isCurrent) {
          setCollection(fetchedCollection);
        }
      } catch (err) {
        if (isCurrent) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
          setCollection(null);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadCollection();

    return () => {
      isCurrent = false;
    };
  }, [collectionId, user]);

  return {
    collection,
    fetchCollection,
    loading,
    error,
  };
}
