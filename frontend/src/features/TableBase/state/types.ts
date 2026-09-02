import type {
  AnyTableSchema,
  TableColumn,
  TableColumnKey,
} from "../types";

/**
 * Tracks the user-facing settings for a table instance.
 */
export type TableSettingsState<
  Schema extends AnyTableSchema = AnyTableSchema,
> = {
  /**
   * Text from the table search input.
   *
   * This is usually converted into a backend query parameter by the table query
   * builder.
   */
  search: string;

  /**
   * Column definitions/configuration for this table.
   *
   * These define how each column renders, whether it can be hidden, and how its
   * filter value should be converted into query parameters.
   */
  columnDefs: TableColumn<Schema>[];

  /**
   * Visibility overrides for each column.
   *
   * The keys match columnDefs[number].key. The object is partial because it only
   * needs to store user overrides. If a key is missing, the table can fall back
   * to the column's defaultVisible setting.
   */
  columnVisibility: Partial<Record<TableColumnKey<Schema>, boolean>>;

  /**
   * Active filter values for each column.
   *
   * The keys match columnDefs[number].key. The value is unknown because each
   * filter kind can store a different shape, such as string, string[], boolean,
   * or a date range object.
   */
  columnFilters: Partial<
    Record<TableColumnKey<Schema> | string, unknown>
  >;

  /**
   * Number of rows shown on each client-side table page.
   */
  rowsPerPage: number;
};

/**
 * Actions for updating table settings.
 *
 * The column-based setters use TableColumnKey so callers can only update
 * columns that exist on the row type or are explicitly allowed virtual keys.
 */
export type TableSettingsActions<
  Schema extends AnyTableSchema = AnyTableSchema,
> = {
  /**
   * Updates the global table search term.
   */
  setSearch(value: string): void;

  /**
   * Replaces the column definitions/configuration for this table instance.
   * Usually done on the mount of the component when loading
   */
  setColumnDefs(config: TableColumn<Schema>[]): void;

  /**
   * Sets a column's visibility directly.
   */
  setColumnVisibility(
    key: TableColumnKey<Schema>,
    visible: boolean,
  ): void;

  /**
   * Flips a column between visible and hidden.
   */
  toggleColumnVisibility(key: TableColumnKey<Schema>): void;

  /**
   * Sets the active filter value for a column.
   */
  setColumnFilterValue(
    key: TableColumnKey<Schema>,
    value: unknown,
  ): void;

  /**
   * Removes the active filter value for a single column.
   */
  clearColumnFilterValue(key: TableColumnKey<Schema>): void;

  /**
   * Removes all active column filters.
   */
  clearColumnFilters(): void;

  /**
   * Updates the number of rows shown per page.
   */
  setRowsPerPage(value: number): void;
};

export type TableSessionState = {
  selectedIds: string[];
  refreshKey: number;
  page: number;
  offset: number;
};

export type TableSessionActions = {
  setSelectedIds(ids: string[]): void;
  toggleSelectedId(id: string): void;
  clearSelectedIds(): void;
  refreshRows(): void;
  setPage(page: number): void;
  setOffset(offset: number): void;
};

export type TableStore<
  Schema extends AnyTableSchema = AnyTableSchema,
> = TableSettingsState<Schema> &
  TableSettingsActions<Schema> &
  TableSessionState &
  TableSessionActions;
