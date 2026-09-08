import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../Auth";
import QuestionAccessApi from "../api";
import type {
  QuestionAccess,
  QuestionId,
  ShareableAccessLevel,
  UserId,
} from "../types";

export function useUpdateQuestionShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateQuestionShare = useCallback(
    async (
      questionId: QuestionId,
      targetUserId: UserId,
      level: ShareableAccessLevel,
    ): Promise<QuestionAccess | null> => {
      if (!user) {
        setError("You must be signed in to update question access");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        return await QuestionAccessApi.updateQuestionShare(
          token,
          questionId,
          targetUserId,
          { level },
        );
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to update question access",
          );
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

  return { updateQuestionShare, loading, error };
}
