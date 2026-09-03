import { useEffect, useMemo } from "react";

import { type TableStore, useTableBaseContext } from "../../TableBase/state";
import {
  createMyQuestionTableColumns,
  type QuestionTableSchema,
} from "../columns";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { usePersonalQuestionsTableRows } from "../hooks";
import { QuestionTableLayout } from "./QuestionTableLayout";
import type { QuestionTableViewProps } from "./types";

export default function DeveloperQuestionsTable({
  onRowSelect,
  baseQuery,
}: QuestionTableViewProps) {
  const columnDefs = useMemo(() => createMyQuestionTableColumns(), []);
  const setColumnDefs = useTableBaseContext<
    QuestionTableSchema,
    TableStore<QuestionTableSchema>["setColumnDefs"]
  >((s) => s.setColumnDefs);
  const query = useQuestionTableQuery(columnDefs, baseQuery);
  const refreshKey = useTableBaseContext<QuestionTableSchema, number>(
    (s) => s.refreshKey,
  );

  useEffect(() => {
    setColumnDefs(columnDefs);
  }, [columnDefs, setColumnDefs]);

  // POST /developer/tables/questions/search
  const { rows: questions } = usePersonalQuestionsTableRows(query, refreshKey);

  return (
    <QuestionTableLayout
      columnDefs={columnDefs}
      questions={questions}
      onRowSelect={onRowSelect}
    />
  );
}
