import { useEffect, useState } from "react";
import type { TableRowsResult } from "../config/types";
type QuestionTableRowsRequestOptions<Row> = {
  enabled?: boolean;
  refreshKey?: number;
  request: () => Promise<Row[]>;
};

export function useQuestionTableRowsRequest<Row>({
  enabled = true,
  refreshKey,
  request,
}: QuestionTableRowsRequestOptions<Row>): TableRowsResult<Row> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!enabled) {
        setQuestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await request();
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
  }, [enabled, request, refreshKey]);

  return { rows: questions, loading, error };
}
