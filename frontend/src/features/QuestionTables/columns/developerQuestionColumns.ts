import { createBaseQuestionTableColumns } from "./baseQuestionColumns";
import type { QuestionTableColumn } from "./types";

export function createMyQuestionTableColumns(): QuestionTableColumn[] {
  return createBaseQuestionTableColumns();
}
