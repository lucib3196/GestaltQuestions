import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableProps } from "./type";
import { TableBaseProvider } from "../../TableBase";
import type {
  QuestionTableSearchParams,
  SharedQuestionTableRow,
} from "../../../services";
import type { TableConfig } from "../../TableBase/config/types";
import type { TableSchema } from "../../TableBase";
import { useSharedWithMeQuestionTableRows } from "../hooks";
import type { QuestionTableColumn, QuestionTableColumnId } from "../columnConfig";
import { createQuestionTableColumns } from "../columnConfig";

type SharedWithMeSchema = TableSchema<
  SharedQuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type Config = TableConfig<SharedWithMeSchema>;

const SHARED_WITH_ME_COLUMN_IDS = [
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

function createSharedWithMeColumns(): QuestionTableColumn<SharedWithMeSchema>[] {
  return createQuestionTableColumns<SharedWithMeSchema>(
    SHARED_WITH_ME_COLUMN_IDS,
  );
}

export const sharedWithMeQuestionsTableConfig: Config = {
  id: "shared-with-me-questions",
  persistKey: "shared-with-me-question-table-settings",
  createColumnDefs: createSharedWithMeColumns,
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
