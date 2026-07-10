import { useMyQuestions } from "./hooks/hooks";
import { QuestionTableBase } from "./components";
import {
  QuestionTableProvider,
  useQuestionTableContext,
} from "./instance/context";
import { createAllQuestionTableColumns } from "./config/columns";
import QuestionTableToolBar from "./components/toolbar/QuestionTableToolBar";
import { buildQuestionTableQuery } from "./utils/buildQuestionTableQuery";
import { useMemo } from "react";
export function TestTable() {
  const columns = useMemo(() => createAllQuestionTableColumns(), []);
  const searchTerm = useQuestionTableContext((s) => s.search);
  const rawFilters = useQuestionTableContext((s) => s.filters);

  const filter = useMemo(
    () => buildQuestionTableQuery(columns, rawFilters, searchTerm),
    [columns, searchTerm, rawFilters],
  );


  const { questions } = useMyQuestions(filter);
  return (
    <div className="flex flex-col h-dvh">
      <QuestionTableToolBar columns={columns} />

      <QuestionTableBase
        data={questions}
        getRowId={(t) => t.question_id}
        columns={columns}
      />
    </div>
  );
}

export function Table() {
  return (
    <QuestionTableProvider
      initialState={{
        limit: 25,
      }}
    >
      <TestTable />
    </QuestionTableProvider>
  );
}
