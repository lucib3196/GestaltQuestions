import { useEffect, useMemo } from "react";

import { TableBaseDataTable } from "../components";
import type { TableConfig } from "../config/types";
import type { TableStore } from "../state";
import { useTableBaseContext } from "../state";
import type { AnyTableSchema, PartialQuery } from "../types";
import { buildQuery } from "./buildQuery";
type Props<Schema extends AnyTableSchema = AnyTableSchema> = {
  config: TableConfig<Schema>;
  baseQuery: PartialQuery<Schema>;
};
export function TableBaseView<Schema extends AnyTableSchema = AnyTableSchema>({
  config,
  baseQuery,
}: Props<Schema>) {
  // Build and publish the column definitions used by this table instance.
  const columnsDef = useMemo(() => config.createColumnDefs(), [config]);
  const setColumnDefs = useTableBaseContext<
    Schema,
    TableStore<Schema>["setColumnDefs"]
  >((s) => s.setColumnDefs);

  useEffect(() => setColumnDefs(columnsDef), [columnsDef, setColumnDefs]);

  // Read the current table controls from shared state.
  const searchTerm = useTableBaseContext<Schema, string>((s) => s.search);
  const rawFilters = useTableBaseContext<
    Schema,
    TableStore<Schema>["columnFilters"]
  >((s) => s.columnFilters);
  const refreshKey = useTableBaseContext<Schema, number>((s) => s.refreshKey);

  // Convert table controls into the query shape expected by the row loader.
  const query = useMemo(
    () => buildQuery(columnsDef, rawFilters, searchTerm, baseQuery),
    [columnsDef, rawFilters, searchTerm, baseQuery],
  );

  // Load rows for the current query, using refreshKey to force a refetch.
  const { rows } = config.useRows(query, refreshKey);

  return (
    <TableBaseDataTable
      data={rows}
      columnDefs={columnsDef}
      getRowId={config.getRowId}
    />
  );
}
