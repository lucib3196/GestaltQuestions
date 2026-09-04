import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableProps } from "./type";
import { TableBaseProvider } from "../../TableBase";
import type { QuestionTableSearchParams } from "../../../services";
import type { TableConfig } from "../../TableBase/config/types";
import type { TableSchema } from "../../TableBase";
import { useSharedByMeQuestionTableRows } from "../hooks";
import type { QuestionTableColumn, QuestionTableColumnId } from "../columns";
import { createQuestionTableColumns } from "../columns";
import type { SharedQuestionTableRow } from "../../../services";

type SharedByMeSchema = TableSchema<
  SharedQuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type Config = TableConfig<SharedByMeSchema>;

const SHARED_BY_ME_COLUMN_IDS = [
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

function createSharedByMeColumns(): QuestionTableColumn<SharedByMeSchema>[] {
  return createQuestionTableColumns<SharedByMeSchema>(SHARED_BY_ME_COLUMN_IDS);
}

export const sharedByMeQuestionsTableConfig: Config = {
  id: "shared-by-me-questions",
  persistKey: "shared-by-me-question-table-settings",
  createColumnDefs: createSharedByMeColumns,
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
