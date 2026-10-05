import {
  QuestionAccessApi,
  type QuestionId,
  type UserId,
} from "../../services/Access";
import { useRevokeAccess } from "../resourceAccess";

export function useRevokeQuestionAccess() {
  const { revokeAccess, loading, error, result } = useRevokeAccess({
    resourceName: "question",
    revokeRequest: QuestionAccessApi.unshareQuestion,
  });

  return {
    revokeQuestionAccess: (questionId: QuestionId, targetUserId: UserId) =>
      revokeAccess(questionId, targetUserId),
    loading,
    error,
    result,
  };
}
