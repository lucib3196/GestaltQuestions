import type { RowId, TableColumn } from "../../../components/Table";

export type TableRowsResult<Row> = {
  rows: Row[];
  loading: boolean;
  error: string | null;
};

export type TableConfig<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
> = {
  id: string;
  /**
   * Used by Zustand persist. This should be unique per table.
   */
  persistKey: string;
  /**
   * Column render/filter configuration for this table.
   */
  createColumnDefs: () => TableColumn<Row, VirtualKey, Query>[];
  /**
   * How the table gets a stable id from each row.
   */
  getRowId: (row: Row) => RowId;
  /**
   * Hook used by the generic table view to fetch rows.
   */
  useRows: (query: Query, refreshKey: number) => TableRowsResult<Row>;
};
