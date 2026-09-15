import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "../../services/Auth";
import DeveloperQuestionsApi from "../../services/DeveloperQuestions/api";
import {
  showSignedOutBatchActionError,
  summarizeBatchQuestionAction,
} from "./batchQuestionAction";

export function useDownloadQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const downLoadQuestions = useCallback(
    async (qids: string[]) => {
      setLoading(true);
      setError(null);

      if (!user) {
        showSignedOutBatchActionError(
          "You must be signed in to download questions.",
          setError,
        );
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const results = await Promise.allSettled(
          qids.map((qid) => DeveloperQuestionsApi.downloadQuestion(token, qid)),
        );

        summarizeBatchQuestionAction(
          results,
          qids,
          {
            actionProgressPastTense: "Started",
            failureVerb: "download",
            singleSuccessMessage: "Question download started.",
            pluralSuccessMessage: (count) =>
              `${count} question downloads started.`,
          },
          setError,
        );

        return results;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to process download requests.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return { downLoadQuestions, loading, error };
}
