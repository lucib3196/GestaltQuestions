import { useCallback, useState } from "react";

import { useAuth } from "../../services/Auth";
import QuestionAccessApi from "../../services/Access/QuestionAccess/api";
import type {
  QuestionId,
  ResourceAccessRevokeResult,
  UserId,
} from "../../services/Access/QuestionAccess/types";

export function useRevokeQuestionAccess() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResourceAccessRevokeResult | null>(null);
  const { user } = useAuth();

  const revokeQuestionAccess = useCallback(
    async (questionId: QuestionId, targetUserId: UserId) => {
      if (!user) {
        setError("You must be signed in to revoke question access");
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const token = await user.getIdToken();
        const revokeResult = await QuestionAccessApi.unshareQuestion(
          token,
          questionId,
          targetUserId,
        );

        setResult(revokeResult);

        return revokeResult;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to revoke question access";

        setError(message);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    revokeQuestionAccess,
    loading,
    error,
    result,
  };
}
