import { toast } from "react-toastify";

type BatchActionCopy = {
  actionProgressPastTense: string;
  failureVerb: string;
  singleSuccessMessage: string;
  pluralSuccessMessage: (count: number) => string;
};

export function summarizeBatchQuestionAction(
  results: PromiseSettledResult<unknown>[],
  qids: string[],
  copy: BatchActionCopy,
  setError: (error: string) => void,
) {
  const failedQids = results
    .map((result, index) => (result.status === "rejected" ? qids[index] : null))
    .filter((qid): qid is string => qid !== null);
  const successCount = results.length - failedQids.length;

  if (failedQids.length === 0) {
    toast.success(
      successCount === 1
        ? copy.singleSuccessMessage
        : copy.pluralSuccessMessage(successCount),
    );
    return;
  }

  if (successCount === 0) {
    const message =
      failedQids.length === 1
        ? `Failed to ${copy.failureVerb} question ${failedQids[0]}.`
        : `Failed to ${copy.failureVerb} ${failedQids.length} questions.`;
    setError(message);
    toast.error(message);
    return;
  }

  const failedList = failedQids.slice(0, 3).join(", ");
  const remaining =
    failedQids.length > 3 ? ` +${failedQids.length - 3} more` : "";
  const message = `${copy.actionProgressPastTense} ${successCount}/${results.length}. Failed: ${failedList}${remaining}.`;
  setError(message);
  toast.warn(message);
}

export function showSignedOutBatchActionError(
  message: string,
  setError: (error: string) => void,
) {
  setError(message);
  toast.error(message);
}
