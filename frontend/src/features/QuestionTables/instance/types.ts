export type RowId = string;

export type TableColumn<T> = {
  key: string;
  default?: boolean;
  render?: (row: T, className?: string) => React.ReactNode;
};
