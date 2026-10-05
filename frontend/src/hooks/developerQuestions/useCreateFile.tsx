import { useCallback, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";

export function useCreateFile(onRefresh?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createFile = useCallback(
    async (questionId: string, filename: string, initialContent = "") => {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to create files.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        await DeveloperQuestionsApi.writeFile(
          token,
          questionId,
          filename,
          initialContent,
        );
        onRefresh?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create file");
      } finally {
        setLoading(false);
      }
    },
    [user, onRefresh],
  );

  return { createFile, loading, error };
}
