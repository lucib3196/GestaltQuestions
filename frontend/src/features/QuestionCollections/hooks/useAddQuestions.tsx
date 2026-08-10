import { useAuth } from "../../Auth";
import { CollectionsApi } from "../../../services";
import { useState } from "react";

export function useAddQuestionToCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestionToCollection = async (
    collectionIds: string[],
    questionIds: string[],
  ) => {
    if (!user) {
      setError("Sign in to add questions to collections.");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const pairs = collectionIds.flatMap((collectionId) =>
        questionIds.map((questionId) => [collectionId, questionId] as const),
      );

      const results = await Promise.all(
        pairs.map(([collectionId, questionId]) =>
          CollectionsApi.addQuestionToCollection(
            token,
            collectionId,
            questionId,
          ),
        ),
      );

      return results;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to add questions to collections.";

      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { addQuestionToCollection, loading, error };
}
