import { useEffect, useMemo } from "react";

import { createMyQuestionTableColumns } from "../columns";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { usePersonalQuestionsTableRows } from "../hooks";
import { useQuestionTableContext } from "../state/context";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";

export default function DeveloperQuestionsTable({
  onRowSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const columnDefs = useMemo(() => createMyQuestionTableColumns(), []);
  const setColumns = useQuestionTableContext((s) => s.setQuestionTableColumns);
  const query = useQuestionTableQuery(columnDefs, baseQuery);
  const refreshKey = useQuestionTableContext((s) => s.refreshKey);

  useEffect(() => {
    setColumns(columnDefs);
  }, [columnDefs, setColumns]);

  // POST /developer/tables/questions/search
  const { questions } = usePersonalQuestionsTableRows(query, refreshKey);

  return (
    <QuestionTableLayout
      columnDefs={columnDefs}
      questions={questions}
      onRowSelect={onRowSelect}
    />
  );
}
