import type {
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../../services";
import type { RowId, TableSchema } from "../../TableBase";
import { TableBaseSearch } from "../../TableBase/components/search";
import { TableBaseProvider, useTableBaseContext } from "../../TableBase";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableConfig } from "../../TableBase/config/types";
import type {
  QuestionTableColumn,
  QuestionTableColumnId,
} from "../../QuestionTables";
import { createQuestionTableColumns } from "../../QuestionTables";
import { usePersonalQuestionsTableRows } from "../../QuestionTables";
import { useAddQuestionToCollection } from "../../QuestionCollections/hooks/useAddQuestions";
import { useCollectionStore } from "../../QuestionCollections/instance/context";
type SearchQuestionsSchema = TableSchema<
  QuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type SearchQuestionsTableConfig = TableConfig<SearchQuestionsSchema>;

type SearchQuestionsProps = {
  onQuestionSelect?: (questionId: RowId) => void;
  baseQuery?: Partial<QuestionTableSearchParams>;
};

const SEARCH_QUESTIONS_COLUMN_IDS = [
  "select",
  "title",
  "isAdaptive",
  "topics",
  "question_type",
] as const satisfies readonly QuestionTableColumnId[];

const SEARCH_QUESTIONS_PERSIST_KEY =
  "add-questions-to-collection-table-settings";

function createSearchQuestionColumns(): QuestionTableColumn<SearchQuestionsSchema>[] {
  return createQuestionTableColumns<SearchQuestionsSchema>(
    SEARCH_QUESTIONS_COLUMN_IDS,
  );
}

const searchQuestionsTableConfig: SearchQuestionsTableConfig = {
  id: "add-questions-to-collection",
  persistKey: SEARCH_QUESTIONS_PERSIST_KEY,
  createColumnDefs: createSearchQuestionColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    usePersonalQuestionsTableRows(query, refreshKey),
};

function SearchQuestionsTable({
  onQuestionSelect,
  baseQuery = {},
}: SearchQuestionsProps) {
  const selectedIds = useTableBaseContext((s) => s.selectedIds);
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const { addQuestionToCollection } = useAddQuestionToCollection();

  const handleAdd = () => {
    if (!selectedCollection) return;
    addQuestionToCollection([selectedCollection.id], selectedIds);
  };

  return (
    <div>
      <TableBaseView<SearchQuestionsSchema>
        config={searchQuestionsTableConfig}
        baseQuery={{ offset: 0, limit: 5, ...baseQuery }}
        onRowSelect={onQuestionSelect}
      />
      Selected : {selectedIds}
      Collection : {selectedCollection.id}
      <button onClick={() => handleAdd()}>Add Questions</button>
    </div>
  );
}

export function SearchQuestions({
  onQuestionSelect,
  baseQuery,
}: SearchQuestionsProps) {
  return (
    <TableBaseProvider<SearchQuestionsSchema>
      persistKey={SEARCH_QUESTIONS_PERSIST_KEY}
    >
      <div className="flex min-h-0 flex-col gap-3">
        <TableBaseSearch placeholder="Search questions by title" />
        <SearchQuestionsTable
          baseQuery={baseQuery}
          onQuestionSelect={onQuestionSelect}
        />
      </div>
    </TableBaseProvider>
  );
}

export default function SearchAndAddQuestions() {
  return (
    <div>
      Add Question to collections <SearchQuestions />
    </div>
  );
}
