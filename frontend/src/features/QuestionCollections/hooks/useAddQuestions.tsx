import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

import { CollectionsApi } from "../../../services";
import { useAuth } from "../../Auth";

type AddQuestionToCollectionOptions = {
  onSuccess?: () => void;
};

export function useAddQuestionToCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestionToCollection = async (
    collectionIds: string[],
    questionIds: string[],
    options?: AddQuestionToCollectionOptions,
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

      toast.success("Questions added to collections successfully.");
      options?.onSuccess?.();

      return results;
    } catch (err) {
      const message =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err instanceof Error
            ? err.message
            : "Unable to add questions to collections.";

      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { addQuestionToCollection, loading, error };
}
