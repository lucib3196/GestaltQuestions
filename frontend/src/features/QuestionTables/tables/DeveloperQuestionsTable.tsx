import { useMemo } from "react";

import { createMyQuestionTableColumns } from "../config/columns";
import { useDeveloperQuestionsTableRows } from "../hooks/hooks";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";
import { useQuestionTableQuery } from "./useQuestionTableQuery";

export default function DeveloperQuestionsTable({
  onQuestionSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const columns = useMemo(() => createMyQuestionTableColumns(), []);
  const query = useQuestionTableQuery(columns, baseQuery);

  // POST /developer/tables/questions/search
  const { questions } = useDeveloperQuestionsTableRows(query);

  return (
    <QuestionTableLayout
      columns={columns}
      questions={questions}
      onQuestionSelect={onQuestionSelect}
    />
  );
}
