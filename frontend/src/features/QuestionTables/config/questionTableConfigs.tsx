import type { TableConfig } from "../../TableBase/config/types";
import type { QuestionTableSchema } from "../columns";
import {
  createAllQuestionTableColumns,
  createMyQuestionTableColumns,
} from "../columns";
import { usePublishedQuestionsTableRows } from "../hooks";
import { usePersonalQuestionsTableRows } from "../hooks";
import { useSharedByMeQuestionTableRows } from "../hooks";
import { useSharedWithMeQuestionTableRows } from "../hooks";
// Base QuestionConfig for most cases this is the legacy at this point

type QuestionConfig = TableConfig<QuestionTableSchema>;

export const personalQuestionsTableConfig: QuestionConfig = {
  id: "personal-questions",
  persistKey: "personal-question-table-settings",
  createColumnDefs: createMyQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    usePersonalQuestionsTableRows(query, refreshKey),
};

export const publishedQuestionsTableConfig: QuestionConfig = {
  id: "published-questions",
  persistKey: "published-question-table-settings",
  createColumnDefs: createAllQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query) => usePublishedQuestionsTableRows(query),
};

export const sharedByMeQuestionsTableConfig: QuestionConfig = {
  id: "shared-by-me-questions",
  persistKey: "shared-by-me-question-table-settings",
  createColumnDefs: createMyQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    useSharedByMeQuestionTableRows(query, refreshKey),
};

export const sharedWithMeQuestionsTableConfig: QuestionConfig = {
  id: "shared-with-me-questions",
  persistKey: "shared-with-me-question-table-settings",
  createColumnDefs: createAllQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    useSharedWithMeQuestionTableRows(query, refreshKey),
};
