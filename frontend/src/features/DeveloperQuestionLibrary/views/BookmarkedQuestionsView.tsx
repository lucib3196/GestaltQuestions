import { useNavigate } from "react-router-dom";

import type {
  QuestionTableRowBase,
  QuestionTableSearchParams,
} from "../../../services";
import { useQuestionBookmarks } from "../../Published/questionBookmarksContext";
import { createBaseQuestionTableColumns } from "../../QuestionTables/columnConfig/baseQuestionColumns";
import { useBookmarkedQuestionsTableRows } from "../../QuestionTables/hooks";
import type { TableSchema } from "../../TableBase";
import { TableBaseProvider } from "../../TableBase";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableConfig } from "../../TableBase/config/types";
import { ManageableQuestionsToolbar } from "../toolbar/ManageableQuestionsToolbar";

type BookmarkedQuestionsSchema = TableSchema<
  QuestionTableRowBase,
  "select",
  QuestionTableSearchParams
>;

const bookmarkedQuestionsTableConfig: TableConfig<BookmarkedQuestionsSchema> =
  {
    id: "developer-bookmarked-questions",
    persistKey: "developer-bookmarked-question-table-settings",
    createColumnDefs: createBaseQuestionTableColumns,
    getRowId: (row) => row.question_id,
    useRows: (query, refreshKey) =>
      useBookmarkedQuestionsTableRows(query, refreshKey),
  };

export function BookmarkedQuestionsView() {
  const navigate = useNavigate();
  const { loading } = useQuestionBookmarks();

  return (
    <TableBaseProvider<BookmarkedQuestionsSchema>
      persistKey={bookmarkedQuestionsTableConfig.persistKey}
    >
      <section className="flex min-w-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">
            Bookmarked Questions
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Questions you have bookmarked.
          </p>
        </div>
        <ManageableQuestionsToolbar />
        {loading ? (
          <div className="flex min-h-72 items-center justify-center text-sm font-medium text-text-muted">
            Loading bookmarks...
          </div>
        ) : (
          <TableBaseView<BookmarkedQuestionsSchema>
            config={bookmarkedQuestionsTableConfig}
            baseQuery={{}}
            onRowSelect={(rowId) =>
              navigate(`/question_builder/questions/${rowId}/edit`)
            }
          />
        )}
      </section>
    </TableBaseProvider>
  );
}
