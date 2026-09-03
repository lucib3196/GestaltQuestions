import { useEffect, useMemo } from "react";

import { createAllQuestionTableColumns } from "../columns";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { usePublishedQuestionsTableRows } from "../hooks";
import { useQuestionTableContext } from "../state/context";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";

export function PublishedQuestionsTable({
  onRowSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const setColumns = useQuestionTableContext((s) => s.setQuestionTableColumns);
  const columnDefs = useMemo(() => createAllQuestionTableColumns(), []);
  const query = useQuestionTableQuery(columnDefs, baseQuery);

  useEffect(() => {
    setColumns(columnDefs);
  }, [columnDefs, setColumns]);

  // POST /question-tables/published/search
  const { questions } = usePublishedQuestionsTableRows(query);

  return (
    <QuestionTableLayout
      columnDefs={columnDefs}
      questions={questions}
      onRowSelect={onRowSelect}
    />
  );
}
