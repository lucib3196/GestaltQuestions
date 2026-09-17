import { type QuestionAccess, QuestionAccessApi } from "../../services/Access";
import { useRetrieveAccess as useResourceRetrieveAccess } from "../resourceAccess";

export function useRetrieveAccess(questionId: string) {
  return useResourceRetrieveAccess<QuestionAccess>(questionId, {
    resourceName: "question",
    retrieveRequest: QuestionAccessApi.retrieveAccess,
  });
}
