import { useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";
import CollectionsApi from "../../services/Collections/api";
import type {
  QuestionCollectionRead,
  SearchCollectionsParams,
<<<<<<<< HEAD:frontend/src/hooks/collections/useSearchCollections.ts
} from "../../services/Collections/types";
========
} from "../../../services";
import { CollectionsApi } from "../../../services";
import { useAuth } from "../../../services/Auth";
>>>>>>>> main:frontend/src/features/DeveloperQuestionLibrary/hooks/useSearchCollections.ts

export function useSearchCollections(
  search: SearchCollectionsParams = { title: "", limit: 3 },
) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<QuestionCollectionRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function searchCollections() {
      if (!user) {
        setCollections([]);
        setLoading(false);
        setError("Sign in to search collections.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const results = await CollectionsApi.searchCollections(token, search);

        if (!cancelled) {
          setCollections(results);
        }
      } catch (err) {
        if (!cancelled) {
          setCollections([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to search collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    searchCollections();

    return () => {
      cancelled = true;
    };
  }, [search, user]);

  return {
    collections,
    loading,
    error,
  };
}
