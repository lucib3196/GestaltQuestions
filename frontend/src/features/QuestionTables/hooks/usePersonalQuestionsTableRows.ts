import { useCallback } from "react";

import {
  QuestionTablesApi,
  type QuestionTableSearchParams,
} from "../../../services";
import { useTableRowsRequest } from "../../TableBase/hooks/useTableRowRequest";
import { useAuth } from "../../Auth";

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

  return useTableRowsRequest({
    enabled: Boolean(user),
    refreshKey,
    request,
  });
}
