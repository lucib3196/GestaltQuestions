import { useCallback, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";

export function useSaveFile(onRefresh?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveFile = useCallback(
    async (questionId: string, filename: string, content: unknown) => {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to save files.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        await DeveloperQuestionsApi.writeFile(
          token,
          questionId,
          filename,
          content,
        );
        onRefresh?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save file");
      } finally {
        setLoading(false);
      }
    },
    [user, onRefresh],
  );

  return { saveFile, loading, error };
}
