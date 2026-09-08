import { useCallback, useState } from "react";

import { useAuth } from "../../../Auth";
import QuestionAccessApi from "../api";
import type {
  ShareQuestionBatchResult,
  ShareQuestionsWithUsersPayload,
} from "../types";

export function useShareQuestionBatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShareQuestionBatchResult | null>(null);
  const { user } = useAuth();

  const shareQuestionsWithUsers = useCallback(
    async (payload: ShareQuestionsWithUsersPayload) => {
      if (!user) {
        setError("You must be signed in to share question");
        return null;
      }

      if (payload.question_ids.length === 0) {
        setError("Select at least one question to share");
        return null;
      }

      if (payload.target_user_ids.length === 0) {
        setError("Select at least one person to share with");
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const token = await user.getIdToken();
        const batchResult = await QuestionAccessApi.shareQuestionsWithUsers(
          token,
          payload,
        );

        setResult(batchResult);

        return batchResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to share question";

        setError(message);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    shareQuestionsWithUsers,
    loading,
    error,
    result,
  };
}
