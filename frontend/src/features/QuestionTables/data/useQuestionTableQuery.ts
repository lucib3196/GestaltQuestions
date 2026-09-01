import { useMemo } from "react";

import type { QuestionTableSearchParams } from "../../../services";
import type { QuestionTableColumn } from "../columns";
import { useQuestionTableContext } from "../state/context";
import { buildQuestionTableQuery } from "./buildQuestionTableQuery";

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
