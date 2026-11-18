import { useCallback, useMemo } from "react";

import {
  QuestionTablesApi,
  type QuestionTableRow,
  type QuestionTableRowBase,
  type QuestionTableSearchParams,
  type SharedByMeQuestionTableRow,
  type SharedQuestionTableRow,
} from "../../../services";
import { useAuth } from "../../../services/Auth";
import { useQuestionBookmarks } from "../../Published/questionBookmarksContext";
import { useTableRowsRequest } from "../../TableBase/hooks/useTableRowRequest";

type BookmarkedQuestionSearchRow =
  | QuestionTableRow
  | SharedByMeQuestionTableRow
  | SharedQuestionTableRow;

function toQuestionTableRowBase(
  row: BookmarkedQuestionSearchRow,
): QuestionTableRowBase {
  return {
    question_id: row.question_id,
    title: row.title,
    isAdaptive: row.isAdaptive,
    ai_generated: row.ai_generated,
    status: row.status,
    topics: row.topics,
    question_type: row.question_type as QuestionTableRowBase["question_type"],
    available_runtimes:
      row.available_runtimes as QuestionTableRowBase["available_runtimes"],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useBookmarkedQuestionsTableRows(
  params?: QuestionTableSearchParams,
  refreshKey?: number,
) {
  const { user } = useAuth();
  const { bookmarkedQuestionIds } = useQuestionBookmarks();
  const questionIds = useMemo(
    () => [...bookmarkedQuestionIds],
    [bookmarkedQuestionIds],
  );

  const request = useCallback(async () => {
    if (!user || questionIds.length === 0) return [];

    const token = await user.getIdToken();
    const searchParams = { ...params, question_ids: questionIds };
    const [
      publishedQuestions,
      myQuestions,
      sharedByMeQuestions,
      sharedWithMeQuestions,
    ] = await Promise.all([
      QuestionTablesApi.searchPublishedQuestions(searchParams),
      QuestionTablesApi.searchDeveloperQuestions(token, searchParams),
      QuestionTablesApi.searchDeveloperSharedByMeQuestions(token, searchParams),
      QuestionTablesApi.searchDeveloperSharedWithMeQuestions(token, searchParams),
    ]);

    const rowsById = new Map<string, QuestionTableRowBase>();
    for (const row of [
      ...publishedQuestions,
      ...myQuestions,
      ...sharedByMeQuestions,
      ...sharedWithMeQuestions,
    ]) {
      rowsById.set(row.question_id, toQuestionTableRowBase(row));
    }

    return questionIds
      .map((questionId) => rowsById.get(questionId))
      .filter((row): row is QuestionTableRowBase => row !== undefined);
  }, [params, questionIds, user]);

  return useTableRowsRequest({
    enabled: Boolean(user),
    refreshKey,
    request,
  });
}
