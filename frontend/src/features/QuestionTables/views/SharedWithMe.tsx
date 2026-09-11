import type {
  QuestionTableSearchParams,
  SharedQuestionTableRow,
} from "../../../services";
import type { TableSchema } from "../../TableBase";
import { TableBaseProvider } from "../../TableBase";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableConfig } from "../../TableBase/config/types";
import { createSharedWithMeQuestionTableColumns } from "../columnConfig";
import { useSharedWithMeQuestionTableRows } from "../hooks";
import type { TableProps } from "./type";
type SharedWithMeSchema = TableSchema<
  SharedQuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type Config = TableConfig<SharedWithMeSchema>;

export const sharedWithMeQuestionsTableConfig: Config = {
  id: "shared-with-me-questions",
  persistKey: "shared-with-me-question-table-settings",
  createColumnDefs: createSharedWithMeQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    useSharedWithMeQuestionTableRows(query, refreshKey),
};

export function SharedWithMeTableProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableBaseProvider<SharedWithMeSchema>
      persistKey={sharedWithMeQuestionsTableConfig.persistKey}
    >
      {children}
    </TableBaseProvider>
  );
}

export default function SharedWithMeQuestionTable({
  onRowSelect,
  baseQuery = {},
}: TableProps<SharedWithMeSchema>) {
  return (
    <TableBaseView<SharedWithMeSchema>
      config={sharedWithMeQuestionsTableConfig}
      baseQuery={baseQuery}
      onRowSelect={onRowSelect}
    />
  );
}
