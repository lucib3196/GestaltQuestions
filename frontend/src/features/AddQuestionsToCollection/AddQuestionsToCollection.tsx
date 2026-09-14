import { CheckCircle2, Plus, Search } from "lucide-react";

import type {
  QuestionCollection,
  QuestionCollectionRead,
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../services";
import type { RowId, TableSchema } from "../TableBase";
import { TableBaseProvider, useTableBaseContext } from "../TableBase";
import { TableBaseView } from "../TableBase/base/TableBaseView";
import { TableBaseSearch } from "../TableBase/components/search";
import type { TableConfig } from "../TableBase/config/types";
import { useAddQuestionToCollection } from "../QuestionCollections/hooks/useAddQuestions";
import { useCollectionStore } from "../QuestionCollections/instance/context";
import type {
  QuestionTableColumn,
  QuestionTableColumnId,
} from "../QuestionTables";
import {
  createQuestionTableColumns,
  usePersonalQuestionsTableRows,
} from "../QuestionTables";

type AddQuestionsToCollectionSchema = TableSchema<
  QuestionTableRow,
  "select",
  QuestionTableSearchParams
>;

type AddQuestionsToCollectionProps = {
  onQuestionSelect?: (questionId: RowId) => void;
  baseQuery?: Partial<QuestionTableSearchParams>;
  collection?: QuestionCollection | QuestionCollectionRead | null;
};

const ADD_QUESTIONS_COLUMN_IDS = [
  "select",
  "title",
  "isAdaptive",
  "topics",
  "question_type",
] as const satisfies readonly QuestionTableColumnId[];

const ADD_QUESTIONS_PERSIST_KEY = "add-questions-to-collection-table-settings";

function createAddQuestionsColumns(): QuestionTableColumn<AddQuestionsToCollectionSchema>[] {
  return createQuestionTableColumns<AddQuestionsToCollectionSchema>(
    ADD_QUESTIONS_COLUMN_IDS,
  );
}

const addQuestionsTableConfig: TableConfig<AddQuestionsToCollectionSchema> = {
  id: "add-questions-to-collection",
  persistKey: ADD_QUESTIONS_PERSIST_KEY,
  createColumnDefs: createAddQuestionsColumns,
  getRowId: (row) => row.question_id,
  useRows: (query, refreshKey) =>
    usePersonalQuestionsTableRows(query, refreshKey),
};

function SelectionSummary({
  collection,
}: {
  collection?: QuestionCollection | QuestionCollectionRead | null;
}) {
  const selectedIds = useTableBaseContext<
    AddQuestionsToCollectionSchema,
    string[]
  >((s) => s.selectedIds);
  const clearSelectedIds = useTableBaseContext<
    AddQuestionsToCollectionSchema,
    () => void
  >((s) => s.clearSelectedIds);
  const storeSelectedCollection = useCollectionStore(
    (s) => s.selectedCollection,
  );
  const selectedCollection = collection ?? storeSelectedCollection;
  const { addQuestionToCollection, loading, error } =
    useAddQuestionToCollection();

  const selectedCount = selectedIds.length;
  const collectionId = selectedCollection?.id;
  const canAddQuestions =
    Boolean(collectionId) && selectedCount > 0 && !loading;

  async function handleAdd() {
    if (!collectionId || selectedCount === 0) return;

    await addQuestionToCollection([collectionId], selectedIds, {
      onSuccess: clearSelectedIds,
    });
  }


  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
            <p className="text-sm font-semibold text-text">
              {selectedCount === 0
                ? "No questions selected"
                : `${selectedCount} question${selectedCount === 1 ? "" : "s"} selected`}
            </p>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {selectedCollection?.title
              ? `Selected questions will be added to ${selectedCollection.title}.`
              : "Open a collection before adding questions."}
          </p>
          {error ? (
            <p className="mt-2 text-sm font-medium text-warning">{error}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearSelectedIds}
            disabled={selectedCount === 0 || loading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface-secondary px-3 text-sm font-semibold text-text-muted transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAddQuestions}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg shadow-sm transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <Plus className="size-4" aria-hidden="true" />
            {loading ? "Adding..." : "Add selected"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionSearchTable({
  onQuestionSelect,
  baseQuery = {},
}: AddQuestionsToCollectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      <TableBaseView<AddQuestionsToCollectionSchema>
        config={addQuestionsTableConfig}
        baseQuery={{ offset: 0, limit: 5, ...baseQuery }}
        onRowSelect={onQuestionSelect}
      />
    </div>
  );
}

export function AddQuestionsToCollection({
  onQuestionSelect,
  baseQuery,
  collection,
}: AddQuestionsToCollectionProps) {
  return (
    <TableBaseProvider<AddQuestionsToCollectionSchema>
      persistKey={ADD_QUESTIONS_PERSIST_KEY}
    >
      <div className="flex min-h-0 flex-col gap-4">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text">
                Add questions
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Search your question library, select rows, then add them to this
                collection.
              </p>
            </div>
          </div>
          <TableBaseSearch placeholder="Search questions by title" />
        </div>

        <SelectionSummary collection={collection} />
        <QuestionSearchTable
          baseQuery={baseQuery}
          onQuestionSelect={onQuestionSelect}
        />
      </div>
    </TableBaseProvider>
  );
}

export default AddQuestionsToCollection;
