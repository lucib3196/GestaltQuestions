import { useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";
import CollectionAccessApi from "../../services/Access/collectionAccessApi";
import CollectionsApi from "../../services/Collections/api";
import type {
  QuestionCollectionRead,
  SearchCollectionsParams,
} from "../../services/Collections/types";
import type { CollectionView } from "../../features/DeveloperCollections/types";

export function useSearchCollections(
  search: SearchCollectionsParams = { title: "", limit: 3 },
  refreshKey = 0,
  view: CollectionView = "myCollections",
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
        let results: QuestionCollectionRead[];

        if (view === "sharedWithMe") {
          const accessEntries = await CollectionAccessApi.listSharedWithMe(token);
          const collections = await Promise.all(
            accessEntries.map((entry) =>
              CollectionsApi.getCollection(token, entry.collection_id),
            ),
          );
          results = collections
            .filter((collection) =>
              search.title
                ? collection.title
                    .toLowerCase()
                    .includes(search.title.toLowerCase())
                : true,
            )
            .slice(
              search.offset ?? 0,
              (search.offset ?? 0) + (search.limit ?? 10),
            );
        } else {
          results = await CollectionsApi.searchCollections(token, search);
        }

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
  }, [refreshKey, search, user, view]);

  return {
    collections,
    loading,
    error,
  };
}
