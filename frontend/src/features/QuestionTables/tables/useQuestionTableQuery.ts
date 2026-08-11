import { useMemo } from "react";

import type { QuestionTableSearchParams } from "../../../services";
import type { QuestionTableColumn } from "../config/columns";
import { useQuestionTableContext } from "../instance/context";
import { buildQuestionTableQuery } from "../utils/buildQuestionTableQuery";

export function useQuestionTableQuery(
  columns: QuestionTableColumn[],
  baseQuery?: QuestionTableSearchParams,
) {
  const searchTerm = useQuestionTableContext((s) => s.search);
  const rawFilters = useQuestionTableContext((s) => s.filters);

  return useMemo(
    () => ({
      ...buildQuestionTableQuery(columns, rawFilters, searchTerm),
      ...(baseQuery ?? {}),
    }),
    [columns, searchTerm, rawFilters, baseQuery],
  );
}
