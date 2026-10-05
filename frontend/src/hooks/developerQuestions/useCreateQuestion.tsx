import { useCallback, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import type { DeveloperQuestionCreate } from "../../services/DeveloperQuestions/types";

export function useCreateQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createQuestion = useCallback(
    async (payload: DeveloperQuestionCreate, files?: File[]) => {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to create questions.");
        setLoading(false);
        return null;
      }

      try {
        const token = await user.getIdToken();
        const qCreated = await DeveloperQuestionsApi.createQuestion(
          token,
          payload,
        );

        if (files?.length) {
          await DeveloperQuestionsApi.uploadFiles(token, qCreated.id, files);
        }

        return qCreated.id;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create question",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { createQuestion, loading, error };
}
