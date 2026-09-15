import { useCallback, useState } from "react";

import QuestionAccessApi from "../../services/Access/QuestionAccess/api";
import type {
  QuestionAccess,
  QuestionId,
  ShareableAccessLevel,
  UserId,
} from "../../services/Access/QuestionAccess/types";
import { useAuth } from "../../services/Auth";

export function useUpdateQuestionShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update question access",
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { updateQuestionShare, loading, error };
}
