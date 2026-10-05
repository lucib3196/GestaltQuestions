import { type QuestionAccess, QuestionAccessApi } from "../../services/Access";
import { useShareAccess } from "../resourceAccess";

export function useShareQuestion() {
  const { shareAccess, loading, error } = useShareAccess<QuestionAccess>({
    resourceName: "question",
    shareRequest: QuestionAccessApi.shareQuestion,
  });

  return { shareQuestion: shareAccess, loading, error };
}
