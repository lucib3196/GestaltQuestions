import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import {
  showSignedOutBatchActionError,
  summarizeBatchQuestionAction,
} from "./batchQuestionAction";

export function useCopyQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const copyQuestion = useCallback(
    async (qids: string[]) => {
      setLoading(true);
      setError(null);

      if (!user) {
        showSignedOutBatchActionError(
          "You must be signed in to copy questions.",
          setError,
        );
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const results = await Promise.allSettled(
          qids.map((qid) => DeveloperQuestionsApi.copyQuestion(token, qid)),
        );

        summarizeBatchQuestionAction(
          results,
          qids,
          {
            actionProgressPastTense: "Copied",
            failureVerb: "copy",
            singleSuccessMessage: "Question copied.",
            pluralSuccessMessage: (count) => `${count} questions copied.`,
          },
          setError,
        );

        return results;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to process copy requests.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { copyQuestion, loading, error };
}
