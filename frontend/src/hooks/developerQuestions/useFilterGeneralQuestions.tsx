import { useEffect, useState } from "react";

import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import type { LegacyQuestionAllRow } from "../../services/DeveloperQuestions/types";
import type { QuestionFilter } from "../../services/Questions/types";

export function useFilterGeneralQuestions(filter: QuestionFilter) {
  const [questions, setQuestions] = useState<LegacyQuestionAllRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const data = await DeveloperQuestionsApi.filterAllQuestions(filter);
        if (!cancelled) setQuestions(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load all questions",
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
  }, [filter]);

  return { questions, loading, error };
}
