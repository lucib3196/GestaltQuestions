import { useCallback, useEffect, useRef, useState } from "react";

import {
  QuestionAccessApi,
  type ShareQuestionBatchResult,
  type ShareQuestionsWithUsersPayload,
} from "../../../services";
import { useAuth } from "../../Auth";

export function useShareQuestionBatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShareQuestionBatchResult | null>(null);
  const mountedRef = useRef(true);
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

        if (mountedRef.current) {
          setResult(batchResult);
        }

        return batchResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to share question";

        if (mountedRef.current) {
          setError(message);
        }

        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
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
