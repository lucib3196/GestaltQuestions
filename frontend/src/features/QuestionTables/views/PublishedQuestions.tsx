import { TableBaseProvider } from "../../TableBase";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableConfig } from "../../TableBase/config/types";
import type { TableSchema } from "../../TableBase";
import type {
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../../services";
import { createAllQuestionTableColumns } from "../columnConfig";
import { usePublishedQuestionsTableRows } from "../hooks";
import type { TableProps } from "./type";

type PublishedQuestionsSchema = TableSchema<
  QuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type Config = TableConfig<PublishedQuestionsSchema>;

export const publishedQuestionsTableConfig: Config = {
  id: "published-questions",
  persistKey: "published-question-table-settings",
  createColumnDefs: createAllQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    usePublishedQuestionsTableRows(query, refreshKey),
};

export function PublishedQuestionsTableProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableBaseProvider<PublishedQuestionsSchema>
      persistKey={publishedQuestionsTableConfig.persistKey}
    >
      {children}
    </TableBaseProvider>
  );
}

export default function PublishedQuestionsTable({
  onRowSelect,
  baseQuery = {},
}: TableProps<PublishedQuestionsSchema>) {
  return (
    <TableBaseView<PublishedQuestionsSchema>
      config={publishedQuestionsTableConfig}
      baseQuery={baseQuery}
      onRowSelect={onRowSelect}
    />
  );
}
