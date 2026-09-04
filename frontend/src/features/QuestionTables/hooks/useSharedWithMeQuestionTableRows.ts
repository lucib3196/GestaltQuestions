import { useCallback } from "react";

import {
  QuestionTablesApi,
  type QuestionTableSearchParams,
} from "../../../services";
import { useAuth } from "../../Auth";
import { useTableRowsRequest } from "../../TableBase/hooks/useTableRowRequest";

export function useSharedWithMeQuestionTableRows(
  params?: QuestionTableSearchParams,
  refreshKey?: number,
) {
  const { user } = useAuth();

  const request = useCallback(async () => {
    if (!user) return [];
    const token = await user.getIdToken();
    return QuestionTablesApi.searchDeveloperSharedWithMeQuestions(
      token,
      params,
    );
  }, [user, params]);

  return useTableRowsRequest({
    enabled: Boolean(user),
    refreshKey,
    request,
  });
}
