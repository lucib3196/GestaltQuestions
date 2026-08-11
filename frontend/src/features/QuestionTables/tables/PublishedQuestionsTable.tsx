import { useMemo } from "react";

import { createAllQuestionTableColumns } from "../config/columns";
import { usePublishedQuestionsTableRows } from "../hooks/hooks";
import { QuestionTableLayout } from "./QuestionTableLayout";
import { useQuestionTableContext } from "../instance/context";
import type { QuestionTableViewProps } from "./types";
import { useQuestionTableQuery } from "./useQuestionTableQuery";

export function PublishedQuestionsTable({
  onQuestionSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const setColumns = useQuestionTableContext((s) => s.setQuestionTableColumns);
  const columns = useMemo(() => createAllQuestionTableColumns(), []);
  setColumns(columns);
  const query = useQuestionTableQuery(columns, baseQuery);
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
