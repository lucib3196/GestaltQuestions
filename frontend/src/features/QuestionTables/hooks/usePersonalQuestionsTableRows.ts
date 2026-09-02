import { useCallback } from "react";

import {
  QuestionTablesApi,
  type QuestionTableSearchParams,
} from "../../../services";
import { useAuth } from "../../Auth";

import { useQuestionTableRowsRequest } from "./useQuestionTableRowsRequest";

export function usePersonalQuestionsTableRows(
  params?: QuestionTableSearchParams,
  refreshKey?: number,
) {
  const { user } = useAuth();

  const request = useCallback(async () => {
    if (!user) return [];
    const token = await user.getIdToken();
    return QuestionTablesApi.searchDeveloperQuestions(token, params);
  }, [user, params]);

  return useQuestionTableRowsRequest({
    enabled: Boolean(user),
    refreshKey,
    request,
  });
}
