import type { TableConfig } from "../config/types";
import { useMemo, useEffect } from "react";
import { useQuestionTableContext } from "../state/context";
import { useQuestionTableQuery } from "../data/useQuestionTableQuery";
import { QuestionDataTable } from "../components";
import type { TableStore } from "../state/types";
import type { TableColumn } from "../../../components/Table";

function buildQuery<
  Row,
  VirtualKey extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
>(
  columns: TableColumn<Row, VirtualKey, Query>[],
  rawFilters: Partial<Record<Extract<keyof Row, string> | VirtualKey, unknown>>,
  baseQuery: Partial<Query> = {},
): Partial<Query> {
  return columns.reduce<Partial<Query>>(
    (params, column) => {
      const value = rawFilters[column.key];

      if (column.filter?.toQuery) {
        Object.assign(params, column.filter.toQuery(value));
      }

      return params;
    },
    { ...baseQuery },
  );
}
export function QuestionTableView<
  Row,
  VirtualKey extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
>({
  config,
  baseQuery,
}: {
  config: TableConfig<Row, VirtualKey, Query>;
  baseQuery?: Partial<Query>;
}) {
  // Set the column configurations
  const columnDefs = useMemo(() => config.createColumnDefs(), [config]);
  const setColumnDefs = useQuestionTableContext<
    Row,
    VirtualKey,
    Query,
    TableStore<Row, VirtualKey, Query>["setColumnDefs"]
  >((s) => s.setColumnDefs);

  useEffect(() => {
    setColumnDefs(columnDefs);
  }, [columnDefs, setColumnDefs]);

//   Construct the initial Query for the table
const searchTerm = useQuestionTableContext((s)=>s.search)
const rawFilters  = useQuestionTableContext<
    Row,
    VirtualKey,
    Query,
    TableStore<Row, VirtualKey, Query>["columnFilters"]
  >((s)=>s.columnFilters)

  return (
    <QuestionDataTable
      data={rows}
      columns={columnDefs}
      getRowId={config.getRowId}
    />
  );
}
