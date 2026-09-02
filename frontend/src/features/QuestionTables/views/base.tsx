import type { TableConfig } from "../config/types";
import { useEffect, useMemo } from "react";
import { useQuestionTableContext } from "../state/context";
import { QuestionDataTable } from "../components";
import type { TableStore } from "../state/types";
import type {
  AnyTableSchema,
  TableColumn,
  TableColumnKey,
  TableSchemaQuery,
} from "../../TableBase";

function buildQuery<Schema extends AnyTableSchema>(
  columns: TableColumn<Schema>[],
  rawFilters: Partial<Record<TableColumnKey<Schema> | string, unknown>>,
  search: string,
  baseQuery: Partial<TableSchemaQuery<Schema>> = {},
): TableSchemaQuery<Schema> {
  const query = columns.reduce<Partial<TableSchemaQuery<Schema>>>(
    (params, column) => {
      const value = rawFilters[column.key];

      if (column.filter?.toQuery) {
        Object.assign(params, column.filter.toQuery(value));
      }

      return params;
    },
    { search, ...baseQuery } as Partial<TableSchemaQuery<Schema>>,
  );

  return query as TableSchemaQuery<Schema>;
}
export function QuestionTableView<
  Schema extends AnyTableSchema = AnyTableSchema,
>({
  config,
  baseQuery,
}: {
  config: TableConfig<Schema>;
  baseQuery?: Partial<TableSchemaQuery<Schema>>;
}) {
  // Set the column configurations
  const columnDefs = useMemo(() => config.createColumnDefs(), [config]);
  const setColumnDefs = useQuestionTableContext<
    Schema,
    TableStore<Schema>["setColumnDefs"]
  >((s) => s.setColumnDefs);

  useEffect(() => {
    setColumnDefs(columnDefs);
  }, [columnDefs, setColumnDefs]);

  // Construct the initial query for the table from shared settings.
  const searchTerm = useQuestionTableContext<Schema, string>(
    (s) => s.search,
  );
  const rawFilters = useQuestionTableContext<
    Schema,
    TableStore<Schema>["columnFilters"]
  >((s) => s.columnFilters);
  const refreshKey = useQuestionTableContext<Schema, number>(
    (s) => s.refreshKey,
  );
  const query = useMemo(
    () => buildQuery(columnDefs, rawFilters, searchTerm, baseQuery),
    [columnDefs, rawFilters, searchTerm, baseQuery],
  );
  const { rows } = config.useRows(query, refreshKey);

  return (
    <QuestionDataTable
      data={rows}
      columns={columnDefs}
      getRowId={config.getRowId}
    />
  );
}
