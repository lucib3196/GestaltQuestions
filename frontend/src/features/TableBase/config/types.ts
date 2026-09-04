import type {
  AnyTableSchema,
  RowId,
  TableColumn,
  TableRow,
  TableSchemaQuery,
} from "../../TableBase";

export type TableRowsResult<Row> = {
  rows: Row[];
  loading: boolean;
  error: string | null;
};

export type TableConfig<Schema extends AnyTableSchema = AnyTableSchema> = {
  id: string;
  /**
   * Used by Zustand persist. This should be unique per table.
   */
  persistKey: string;
  /**
   * Column render/filter configuration for this table.
   */
  createColumnDefs: () => TableColumn<Schema>[];
  /**
   * How the table gets a stable id from each row.
   */
  getRowId: (row: TableRow<Schema>) => RowId;
  /**
   * Hook used by the generic table view to fetch rows.
   */
  useRows: (
    query: TableSchemaQuery<Schema>,
    refreshKey: number,
  ) => TableRowsResult<TableRow<Schema>>;
};
