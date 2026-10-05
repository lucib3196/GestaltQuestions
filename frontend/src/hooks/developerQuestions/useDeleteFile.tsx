import { useCallback, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";

export function useDeleteFile(onRefresh?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const deleteFile = useCallback(
    async (questionId: string, filename: string) => {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to upload files.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        await DeveloperQuestionsApi.deleteFile(token, questionId, filename);
        onRefresh?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete file");
      } finally {
        setLoading(false);
      }
    },
    [user, onRefresh],
  );

  return { deleteFile, loading, error };
}
