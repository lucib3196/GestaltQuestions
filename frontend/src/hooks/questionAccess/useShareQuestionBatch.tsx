import { QuestionAccessApi } from "../../services/Access";
import type { ShareQuestionBatchResult } from "../../services/Sharing";
import { useShareBatch } from "../resourceAccess";

export function useShareQuestionBatch() {
  const { share, loading, error, result } = useShareBatch<
    "question_ids",
    ShareQuestionBatchResult
  >({
    resourceKey: "question_ids",
    emptyResourceMessage: "Select at least one question to share",
    shareRequest: QuestionAccessApi.shareQuestionsWithUsers,
  });

  return {
    shareQuestionsWithUsers: share,
    loading,
    error,
    result,
  };
}
