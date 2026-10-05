import {
  QuestionAccessApi,
  type QuestionAccessDetailRead,
} from "../../services/Access";
import { useAccessDetails } from "../resourceAccess";

export function useListSharedByMe(questionId: string) {
  return useAccessDetails<QuestionAccessDetailRead>(questionId, {
    resourceName: "question",
    listAccessDetailsRequest: QuestionAccessApi.listAccessDetails,
  });
}
