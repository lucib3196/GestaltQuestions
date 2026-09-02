import { useState, useCallback, useRef, useEffect } from "react";
import { QuestionAccessApi } from "../../../services";
import { useAuth } from "../../Auth";
import { type ShareAccessPayload } from "../../../services";

export function useQuestionSharing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const shareQuestion = useCallback(
    async (questionId: string, payload: ShareAccessPayload) => {
      if (!user) {
        setError("You must be signed in to share question");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        return await QuestionAccessApi.shareQuestion(
          token,
          questionId,
          payload,
        );
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

  return { shareQuestion, loading, error };
}
