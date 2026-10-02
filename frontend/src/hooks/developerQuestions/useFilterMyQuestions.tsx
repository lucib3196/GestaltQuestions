import { useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import type {
  QuestionFilter,
  QuestionRead,
} from "../../services/Questions/types";

export function useFilterMyQuestions(filter: Partial<QuestionFilter>) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const data = await DeveloperQuestionsApi.filterQuestions(token, filter);
        if (!cancelled) setQuestions(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load questions",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [user, filter]);

  return { questions, loading, error };
}
