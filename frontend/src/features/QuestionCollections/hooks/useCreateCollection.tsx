import { useState } from "react";

import { CollectionsApi } from "../../../services";
import { useAuth } from "../../Auth";
import { useCollectionStore } from "../instance/context";

export default function useCreateCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  const setNormalizedCollections = useCollectionStore(
    (s) => s.setNormalizeCollection,
  );
  const setSelectedCollectionId = useCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  const createCollection = async (title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Enter a collection title.");
      return;
    }

    if (!user) {
      setError("Sign in to create");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const createdCollection = await CollectionsApi.createCollection(token, {
        title: trimmedTitle,
      });
      const collections = await CollectionsApi.getCollections(token);

      setNormalizedCollections(collections);
      setSelectedCollectionId(createdCollection.id ?? "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create collection.",
      );
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, createCollection };
}
