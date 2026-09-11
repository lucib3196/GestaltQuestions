import type { QuestionTableSearchParams } from "../../../services";
import type { SharedByMeQuestionTableRow } from "../../../services";
import type { TableSchema } from "../../TableBase";
import { TableBaseProvider } from "../../TableBase";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableConfig } from "../../TableBase/config/types";
import { createSharedByMeQuestionTableColumns } from "../columnConfig";
import { useSharedByMeQuestionTableRows } from "../hooks";
import type { TableProps } from "./type";

type SharedByMeSchema = TableSchema<
  SharedByMeQuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type Config = TableConfig<SharedByMeSchema>;

export const sharedByMeQuestionsTableConfig: Config = {
  id: "shared-by-me-questions",
  persistKey: "shared-by-me-question-table-settings-v2",
  createColumnDefs: createSharedByMeQuestionTableColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    useSharedByMeQuestionTableRows(query, refreshKey),
};

export function SharedByMeTableProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableBaseProvider<SharedByMeSchema>
      persistKey={sharedByMeQuestionsTableConfig.persistKey}
    >
      {children}
    </TableBaseProvider>
  );
}
export default function SharedByMeQuestionTable({
  onRowSelect,
  baseQuery = {},
}: TableProps<SharedByMeSchema>) {
  return (
    <TableBaseView<SharedByMeSchema>
      config={sharedByMeQuestionsTableConfig}
      baseQuery={baseQuery}
      onRowSelect={onRowSelect}
    />
  );
}
