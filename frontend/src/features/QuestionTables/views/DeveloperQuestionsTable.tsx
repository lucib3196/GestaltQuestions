import { useEffect, useMemo } from "react";

import { createMyQuestionTableColumns } from "../columns";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { useDeveloperQuestionsTableRows } from "../data/useQuestionTableRows";
import { useQuestionTableContext } from "../state/context";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";

export default function DeveloperQuestionsTable({
  onQuestionSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const columns = useMemo(() => createMyQuestionTableColumns(), []);
  const setColumns = useQuestionTableContext((s) => s.setQuestionTableColumns);
  const query = useQuestionTableQuery(columns, baseQuery);
  const refreshKey = useQuestionTableContext((s) => s.refreshKey);

  useEffect(() => {
    setColumns(columns);
  }, [columns, setColumns]);

  // POST /developer/tables/questions/search
  const { questions } = useDeveloperQuestionsTableRows(query, refreshKey);

  return (
    <QuestionTableLayout
      columns={columns}
      questions={questions}
      onQuestionSelect={onQuestionSelect}
    />
  );
}
