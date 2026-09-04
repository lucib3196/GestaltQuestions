import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableProps } from "./type";
import { TableBaseProvider } from "../../TableBase";
import type {
  QuestionTableSearchParams,
  QuestionTableRow,
} from "../../../services";
import type { TableConfig } from "../../TableBase/config/types";
import type { TableSchema } from "../../TableBase";
import { usePersonalQuestionsTableRows } from "../hooks";

import type { QuestionTableColumnId, QuestionTableColumn } from "../columns";
import { createQuestionTableColumns } from "../columns";
type PersonalTSchema = TableSchema<
  QuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type Config = TableConfig<PersonalTSchema>;

const MY_QUESTION_COLUMN_IDS = [
  "select",
  "title",
  "isAdaptive",
  "status",
  "topics",
  "question_type",
  "available_runtimes",
  "created_at",
  "updated_at",
] as const satisfies readonly QuestionTableColumnId[];

export function createMyQuestionTableColumns(): QuestionTableColumn<PersonalTSchema>[] {
  return createQuestionTableColumns<PersonalTSchema>(MY_QUESTION_COLUMN_IDS);
}

export const personalQuestionsTableConfig: Config = {
  id: "personal-questions",
  persistKey: "personal-question-table-settings",
  createColumnDefs: createMyQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    usePersonalQuestionsTableRows(query, refreshKey),
};

export function PersonalQuestionTableProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableBaseProvider<PersonalTSchema>
      persistKey={personalQuestionsTableConfig.persistKey}
    >
      {children}
    </TableBaseProvider>
  );
}
export default function PersonalQuestionTable({
  onRowSelect,
  baseQuery = {},
}: TableProps<PersonalTSchema>) {
  return (
    <TableBaseView<PersonalTSchema>
      config={personalQuestionsTableConfig}
      baseQuery={baseQuery}
      onRowSelect={onRowSelect}
    />
  );
}
