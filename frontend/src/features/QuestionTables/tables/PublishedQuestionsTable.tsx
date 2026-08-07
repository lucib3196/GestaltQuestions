import { useMemo } from "react";

import { createAllQuestionTableColumns } from "../config/columns";
import { usePublishedQuestionsTableRows } from "../hooks/hooks";
import { QuestionTableLayout } from "./QuestionTableLayout";
import { QuestionTableStoreProvider } from "./QuestionTableStoreProvider";
import type { QuestionTableViewProps } from "./types";
import { useQuestionTableQuery } from "./useQuestionTableQuery";

function PublishedQuestionsTableContent({
  onQuestionSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const columns = useMemo(() => createAllQuestionTableColumns(), []);
  const query = useQuestionTableQuery(columns, baseQuery);

  // POST /question-tables/published/search
  const { questions } = usePublishedQuestionsTableRows(query);

  return (
    <QuestionTableLayout
      columns={columns}
      questions={questions}
      showDelete={false}
      onQuestionSelect={onQuestionSelect}
    />
  );
}

export function PublishedQuestionsTable(props: QuestionTableViewProps) {
  return (
    <QuestionTableStoreProvider>
      <PublishedQuestionsTableContent {...props} />
    </QuestionTableStoreProvider>
  );
}
