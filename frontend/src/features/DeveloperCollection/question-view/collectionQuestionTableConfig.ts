import type {
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../../services";
import {
  createBaseQuestionTableColumns,
  usePersonalQuestionsTableRows,
} from "../../QuestionTables";
import type { TableSchema } from "../../TableBase";
import type { TableConfig } from "../../TableBase/config/types";

export type CollectionQuestionSchema = TableSchema<
  QuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

export const collectionQuestionTableConfig: TableConfig<CollectionQuestionSchema> =
  {
    id: "collection-questions",
    persistKey: "collection-questions:v1",
    createColumnDefs: createBaseQuestionTableColumns,
    getRowId: (row) => row.question_id,
    useRows: (query, refreshKey) =>
      usePersonalQuestionsTableRows(query, refreshKey),
  };
