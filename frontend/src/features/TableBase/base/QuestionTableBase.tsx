import type { TableConfig } from "../config/types";
import type { AnyTableSchema, PartialQuery } from "../types";
import { buildQuery } from "./buildQuery";
import type { TableStore } from "../state";
import { useEffect, useMemo } from "react";
import { useQuestionTableContext } from "../state";
import { QuestionDataTable } from "../components";
type Props<Schema extends AnyTableSchema = AnyTableSchema> = {
  config: TableConfig<Schema>;
  baseQuery: PartialQuery<Schema>;
};
export function QuestionTableView<
  Schema extends AnyTableSchema = AnyTableSchema,
>({ config, baseQuery }: Props<Schema>) {
  // Build and publish the column definitions used by this table instance.
  const columnsDef = useMemo(() => config.createColumnDefs(), [config]);
  const setColumnDefs = useQuestionTableContext<
    Schema,
    TableStore<Schema>["setColumnDefs"]
  >((s) => s.setColumnDefs);

  useEffect(() => setColumnDefs(columnsDef), [columnsDef, setColumnDefs]);

  // Read the current table controls from shared state.
  const searchTerm = useQuestionTableContext<Schema, string>((s) => s.search);
  const rawFilters = useQuestionTableContext<
    Schema,
    TableStore<Schema>["columnFilters"]
  >((s) => s.columnFilters);
  const refreshKey = useQuestionTableContext<Schema, number>(
    (s) => s.refreshKey,
  );

  // Convert table controls into the query shape expected by the row loader.
  const query = useMemo(
    () => buildQuery(columnsDef, rawFilters, searchTerm, baseQuery),
    [columnsDef, rawFilters, searchTerm, baseQuery],
  );

  // Load rows for the current query, using refreshKey to force a refetch.
  const { rows } = config.useRows(query, refreshKey);

  return (
    <QuestionDataTable
      data={rows}
      columnDefs={columnsDef}
      getRowId={config.getRowId}
    />
  );
}
