import { useEffect, useMemo } from "react";

import { createAllQuestionTableColumns } from "../columns";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { usePublishedQuestionsTableRows } from "../data/useQuestionTableRows";
import { useQuestionTableContext } from "../state/context";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";

export function PublishedQuestionsTable({
  onQuestionSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const setColumns = useQuestionTableContext((s) => s.setQuestionTableColumns);
  const columns = useMemo(() => createAllQuestionTableColumns(), []);
  const query = useQuestionTableQuery(columns, baseQuery);

  useEffect(() => {
    setColumns(columns);
  }, [columns, setColumns]);

  // POST /question-tables/published/search
  const { questions } = usePublishedQuestionsTableRows(query);

  return (
    <QuestionTableLayout
      columns={columns}
      questions={questions}
      onQuestionSelect={onQuestionSelect}
    />
  );
}
