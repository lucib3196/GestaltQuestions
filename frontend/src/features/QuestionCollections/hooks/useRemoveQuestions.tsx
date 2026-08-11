import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

import { CollectionsApi } from "../../../services";
import { useAuth } from "../../Auth";

type RemoveQuestionsFromCollectionOptions = {
  onSuccess?: () => void;
};

export function useRemoveQuestionsFromCollection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const removeQuestionsFromCollection = async (
    collectionId: string,
    questionIds: string[],
    options?: RemoveQuestionsFromCollectionOptions,
  ) => {
    if (!user) {
      const message = "Sign in to remove questions from collections.";
      setError(message);
      toast.error(message);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const results = await Promise.all(
        questionIds.map((questionId) =>
          CollectionsApi.removeQuestionFromCollection(
            token,
            collectionId,
            questionId,
          ),
        ),
      );

      toast.success("Questions removed from collection successfully.");
      options?.onSuccess?.();

      return results;
    } catch (err) {
      const message =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err instanceof Error
            ? err.message
            : "Unable to remove questions from collection.";

      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { removeQuestionsFromCollection, loading, error };
}
