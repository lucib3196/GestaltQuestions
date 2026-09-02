import { useCallback } from "react";

import {
  QuestionTablesApi,
  type QuestionTableSearchParams,
} from "../../../services";

import { useQuestionTableRowsRequest } from "./useQuestionTableRowsRequest";

export function usePublishedQuestionsTableRows(
  params?: QuestionTableSearchParams,
  refreshKey?: number,
) {
  const request = useCallback(
    () => QuestionTablesApi.searchPublishedQuestions(params),
    [params],
  );

  return useQuestionTableRowsRequest({
    refreshKey,
    request,
  });
}
