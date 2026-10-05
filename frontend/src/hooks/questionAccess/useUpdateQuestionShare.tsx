import {
  type QuestionAccess,
  QuestionAccessApi,
  type QuestionId,
  type ShareableAccessLevel,
  type UserId,
} from "../../services/Access";
import { useUpdateAccess } from "../resourceAccess";

export function useUpdateQuestionShare() {
  const { updateAccess, loading, error } = useUpdateAccess<QuestionAccess>({
    resourceName: "question",
    updateRequest: QuestionAccessApi.updateQuestionShare,
  });

  return {
    updateQuestionShare: (
      questionId: QuestionId,
      targetUserId: UserId,
      level: ShareableAccessLevel,
    ) =>
      updateAccess({
        resourceId: questionId,
        targetUserId,
        level,
      }),
    loading,
    error,
  };
}
