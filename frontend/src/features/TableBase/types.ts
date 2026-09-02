export type RowId = string;

export type ColumnFilterKind =
  | "select"
  | "multiSelect"
  | "text"
  | "dateRange"
  | "booleanToggle";

type TableColumnKey<T, V extends string = never> = Extract<keyof T, string> | V;

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

export type TableColumn<
  T,
  V extends string = never,
  Query extends Record<string, unknown> = Record<string, unknown>,
> = {
  key: TableColumnKey<T, V>;
  label?: string;
  defaultVisible?: boolean;
  hideable?: boolean;
  render?: (
    row: T,
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
    toQuery?: (value: unknown) => Partial<Query>;
  };
};
