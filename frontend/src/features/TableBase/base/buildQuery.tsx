import type {
  AnyTableSchema,
  PartialQuery,
  RawFilters,
  TableColumn,
  TableSchemaQuery,
} from "../types";

export function buildQuery<Schema extends AnyTableSchema>(
  columns: TableColumn<Schema>[],
  rawFilters: RawFilters<Schema>,
  search: string,
  baseQuery: PartialQuery<Schema> = {},
): TableSchemaQuery<Schema> {
  const query = columns.reduce<PartialQuery<Schema>>(
    (params, column) => {
      const value = rawFilters[column.key];

      if (column.filter?.toQuery) {
        Object.assign(params, column.filter.toQuery(value));
      }
      return params;
    },
    {
      search,
      ...baseQuery,
    },
  );
  return query as TableSchemaQuery<Schema>;
}
