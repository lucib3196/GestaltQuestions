import { useEffect, useMemo } from "react";

import {
  createAllQuestionTableColumns,
  type QuestionTableSchema,
} from "../columns";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { usePublishedQuestionsTableRows } from "../hooks";
import { useTableBaseContext, type TableStore } from "../../TableBase/state";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";

export function PublishedQuestionsTable({
  onRowSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const setColumnDefs = useTableBaseContext<
    QuestionTableSchema,
    TableStore<QuestionTableSchema>["setColumnDefs"]
  >((s) => s.setColumnDefs);
  const columnDefs = useMemo(() => createAllQuestionTableColumns(), []);
  const query = useQuestionTableQuery(columnDefs, baseQuery);

  useEffect(() => {
    setColumnDefs(columnDefs);
  }, [columnDefs, setColumnDefs]);

  // POST /question-tables/published/search
  const { rows: questions } = usePublishedQuestionsTableRows(query);

  return (
    <QuestionTableLayout
      columnDefs={columnDefs}
      questions={questions}
      onRowSelect={onRowSelect}
    />
  );
}
