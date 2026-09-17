import { useCallback } from "react";

import {
  QuestionTablesApi,
  type QuestionTableSearchParams,
} from "../../../services";
import { useTableRowsRequest } from "../../TableBase/hooks/useTableRowRequest";

export function usePublishedQuestionsTableRows(
  params?: QuestionTableSearchParams,
  refreshKey?: number,
) {
  const request = useCallback(
    () => QuestionTablesApi.searchPublishedQuestions(params),
    [params],
  );

  return useTableRowsRequest({
    refreshKey,
    request,
  });
}
