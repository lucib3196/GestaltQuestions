import { useCallback, useState } from "react";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";

export function useUploadFile(onRefresh?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadFile = useCallback(
    async (questionId: string, files: File[]) => {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("You must be signed in to delete files.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        await DeveloperQuestionsApi.uploadFiles(token, questionId, files);
        onRefresh?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setLoading(false);
      }
    },
    [user, onRefresh],
  );

  return { uploadFile, loading, error };
}
