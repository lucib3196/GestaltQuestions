export type RowId = string;
// Supports a general query, the type is unknown as it can carry string, booleans, list etc
export type TableQuery = Record<string, unknown>;
/**
 * Carries the row shape, virtual column keys, and query shape for a table.
 *
 * Passing this one schema through the table types keeps the store, column
 * definitions, filters, and query builders aligned without repeating multiple
 * generic parameters everywhere.
 */
export type TableSchema<
  Row = unknown,
  VirtualKey extends string | null = string,
  Query extends TableQuery = TableQuery,
> = {
  row: Row;
  virtualKey: VirtualKey;
  query: Query;
};

export type AnyTableSchema = TableSchema;

export type TableRow<Schema extends AnyTableSchema> = Schema["row"];
export type TableVirtualKey<Schema extends AnyTableSchema> =
  Schema["virtualKey"];
export type TableSchemaQuery<Schema extends AnyTableSchema> = Schema["query"];

//Useful for base queries
export type PartialQuery<Schema extends AnyTableSchema> = Partial<
  TableSchemaQuery<Schema>
>;
export type RawFilters<Schema extends AnyTableSchema> = Partial<
  Record<TableColumnKey<Schema> | string, unknown>
>;

export type ColumnFilterKind =
  | "select"
  | "multiSelect"
  | "text"
  | "dateRange"
  | "booleanToggle";

/**
 * Valid column keys for a table.
 *
 * This can be either a real string key from the row data or a virtual UI-only
 * key, such as "select", that does not exist on the row object.
 */
export type TableColumnKey<Schema extends AnyTableSchema> =
  | Extract<keyof TableRow<Schema>, string>
  | TableVirtualKey<Schema>;

export type TableHeaderRenderContext = {
  label: string;
  columnKey: string;
  visibleRowIds: RowId[];
  selectedIds: RowId[];
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  selectVisibleRows: () => void;
  deselectVisibleRows: () => void;
  toggleVisibleRows: () => void;
};

export type TableColumn<Schema extends AnyTableSchema = AnyTableSchema> = {
  key: TableColumnKey<Schema>;
  label?: string;
  defaultVisible?: boolean;
  hideable?: boolean;
  render?: (
    row: TableRow<Schema>,
    onSelect?: () => void,
    isSelected?: boolean,
    className?: string,
  ) => React.ReactNode;
  headerRender?: (context: TableHeaderRenderContext) => React.ReactNode;
  filter?: {
    kind: ColumnFilterKind;
    label?: string;
    options?: { label: string; value: string }[];
    show?: boolean;
    toQuery?: (value: unknown) => Partial<TableSchemaQuery<Schema>>;
  };
};
