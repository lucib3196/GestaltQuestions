import { useMemo } from "react";

import type { QuestionTableSearchParams } from "../../../services";
import type { RawFilters } from "../../TableBase";
import { buildQuery } from "../../TableBase/base/buildQuery";
import { useTableBaseContext } from "../../TableBase/state";
import type { QuestionTableColumn, QuestionTableSchema } from "../columns";

export function useQuestionTableQuery(
  columnDefs: QuestionTableColumn[],
  baseQuery?: QuestionTableSearchParams,
) {
  const searchTerm = useTableBaseContext<QuestionTableSchema, string>(
    (s) => s.search,
  );
  const rawFilters = useTableBaseContext<
    QuestionTableSchema,
    RawFilters<QuestionTableSchema>
  >((s) => s.columnFilters);

  return useMemo(
    () => buildQuery(columnDefs, rawFilters, searchTerm, baseQuery ?? {}),
    [columnDefs, rawFilters, searchTerm, baseQuery],
  );
}
