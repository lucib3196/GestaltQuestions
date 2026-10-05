import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import {
  showSignedOutBatchActionError,
  summarizeBatchQuestionAction,
} from "./batchQuestionAction";

export function useDeleteQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const deleteQuestion = useCallback(
    async (qids: string[]) => {
      setLoading(true);
      setError(null);

      if (!user) {
        showSignedOutBatchActionError(
          "You must be signed in to delete questions.",
          setError,
        );
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const results = await Promise.allSettled(
          qids.map((qid) => DeveloperQuestionsApi.deleteQuestion(token, qid)),
        );

        summarizeBatchQuestionAction(
          results,
          qids,
          {
            actionProgressPastTense: "Deleted",
            failureVerb: "delete",
            singleSuccessMessage: "Question deleted successfully.",
            pluralSuccessMessage: (count) =>
              `${count} questions deleted successfully.`,
          },
          setError,
        );

        return results;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to process delete requests.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { deleteQuestion, loading, error };
}
