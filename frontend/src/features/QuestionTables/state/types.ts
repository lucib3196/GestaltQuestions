import type { TableColumn } from "../../../components/Table";

/**
 * A valid table column key.
 *
 * This can be either:
 * - a real string key from the row data, such as "question_id" or "title"
 * - a virtual UI-only column key, such as "select"
 *
 * Virtual keys are useful for columns that render table controls but do not
 * exist on the actual row object.
 */
type TableColumnKey<Row, VirtualKey extends string = never> =
  | Extract<keyof Row, string>
  | VirtualKey;

/**
 * Tracks user-facing table settings.
 *
 * These values describe how the table should be displayed and queried, but do
 * not store the fetched row data itself.
 */
type TableSettingsState<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
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
  columnDefs: TableColumn<Row, VirtualKey, Query>[];

  /**
   * Visibility overrides for each column.
   *
   * The keys match columnDefs[number].key. The object is partial because it only
   * needs to store user overrides. If a key is missing, the table can fall back
   * to the column's defaultVisible setting.
   */
  columnVisibility: Partial<Record<TableColumnKey<Row, VirtualKey>, boolean>>;

  /**
   * Active filter values for each column.
   *
   * The keys match columnDefs[number].key. The value is unknown because each
   * filter kind can store a different shape, such as string, string[], boolean,
   * or a date range object.
   */
  columnFilters: Partial<Record<TableColumnKey<Row, VirtualKey>, unknown>>;

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
type TableSettingsActions<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
> = {
  /**
   * Updates the global table search term.
   */
  setSearch(value: string): void;

  /**
   * Replaces the column definitions/configuration for this table instance.
   * Usually done on the mount of the component when loading
   */
  setColumnDefs(config: TableColumn<Row, VirtualKey, Query>[]): void;

  /**
   * Sets a column's visibility directly.
   */
  setColumnVisibility(
    key: TableColumnKey<Row, VirtualKey>,
    visible: boolean,
  ): void;

  /**
   * Flips a column between visible and hidden.
   */
  toggleColumnVisibility(key: TableColumnKey<Row, VirtualKey>): void;

  /**
   * Sets the active filter value for a column.
   */
  setColumnFilterValue(
    key: TableColumnKey<Row, VirtualKey>,
    value: unknown,
  ): void;

  /**
   * Removes the active filter value for a single column.
   */
  clearColumnFilterValue(key: TableColumnKey<Row, VirtualKey>): void;

  /**
   * Removes all active column filters.
   */
  clearColumnFilters(): void;

  /**
   * Updates the number of rows shown per page.
   */
  setRowsPerPage(value: number): void;
};

type QuestionTableSessionState = {
  selectedIds: string[];
};

type QuestionTableSessionActions = {
  setSelectedIds(ids: string[]): void;
  toggleSelectedids(ids: string[]): void;
  clearSelectedIds(): void;
};

export type QuestionTableStore<
  Row,
  VirtualKey extends string = never,
  Query = unknown,
> = TableSettingsState<Row, VirtualKey, Query> &
  TableSettingsActions<Row, VirtualKey, Query> &
  QuestionTableSessionState &
  QuestionTableSessionActions;
