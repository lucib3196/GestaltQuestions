import { useCallback } from "react";

import {
  QuestionTablesApi,
  type QuestionTableSearchParams,
} from "../../../services";
import { useAuth } from "../../../services/Auth";
import { useTableRowsRequest } from "../../TableBase/hooks/useTableRowRequest";

export function usePersonalQuestionsTableRows(
  params?: QuestionTableSearchParams,
  refreshKey?: number,
) {
  const { user } = useAuth();

  const request = useCallback(async () => {
    if (!user) return [];
    const token = await user.getIdToken();
    // this if statement is temp for now? will change depending on feature requirments
    // Allows viewer of collection to see all questions regardless if that question has been shared with them or not
    if (params?.collection_id) {
      return QuestionTablesApi.searchDeveloperCollectionQuestions(
        token,
        params.collection_id,
        params,
      );
    }
    return QuestionTablesApi.searchDeveloperQuestions(token, params);
  }, [user, params]);

  return useTableRowsRequest({
    enabled: Boolean(user),
    refreshKey,
    request,
  });
}
