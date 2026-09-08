import { useCallback, useEffect, useRef, useState } from "react";

import {
  QuestionAccessApi,
  type QuestionId,
  type ResourceAccessRevokeResult,
  type UserId,
} from "../../../services";
import { useAuth } from "../../Auth";

export function useRevokeQuestionAccess() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResourceAccessRevokeResult | null>(null);
  const mountedRef = useRef(true);
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

        if (mountedRef.current) {
          setResult(revokeResult);
        }

        return revokeResult;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to revoke question access";

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
    revokeQuestionAccess,
    loading,
    error,
    result,
  };
}
