import { useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import type { QuestionRead } from "../../services/Questions/types";

export function useQuestionMetadata(qid: string | null | undefined) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questionMetadata, setQuestionMetadata] = useState<QuestionRead | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      if (!user || !qid) {
        if (!cancelled) {
          setQuestionMetadata(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const data = await DeveloperQuestionsApi.getQuestion(token, qid);

        if (!cancelled) setQuestionMetadata(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load question metadata",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [qid, user]);

  return { questionMetadata, loading, error };
}
