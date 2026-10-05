import { useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import type { FileData } from "../../types/fileTypes";

export function useQuestionFileData(qid: string, refreshKey = 0) {
  const { user } = useAuth();
  const [fileData, setFileData] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user) {
        setFileData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const data = await DeveloperQuestionsApi.getQuestionFileData(
          token,
          qid,
        );
        if (!cancelled) setFileData(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load question files",
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
  }, [user, qid, refreshKey]);

  return { fileData, loading, error };
}
